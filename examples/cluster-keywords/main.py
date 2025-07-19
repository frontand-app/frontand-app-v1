"""
Cluster Keywords Flow
AI-powered keyword extraction and clustering from text
"""

import re
import json
from typing import Dict, List, Any
from closedai import flow, llm_call

@flow(gpu="l4", timeout=300, memory=2048)
async def run(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main flow function for clustering keywords from text
    
    Args:
        inputs: Dictionary containing:
            - text: Text to analyze
            - num_clusters: Number of clusters to create (default: 5)
            - min_keywords: Minimum keywords per cluster (default: 2)
            - language: Language of the text (default: "en")
    
    Returns:
        Dictionary containing clustered keywords and analysis
    """
    
    # Extract inputs
    text = inputs.get("text", "")
    num_clusters = inputs.get("num_clusters", 5)
    min_keywords = inputs.get("min_keywords", 2)
    language = inputs.get("language", "en")
    
    if not text.strip():
        return {
            "clusters": [],
            "keywords": [],
            "summary": "No text provided for analysis",
            "language_detected": "unknown"
        }
    
    # Step 1: Detect language if auto
    if language == "auto":
        language = await detect_language(text)
    
    # Step 2: Extract keywords from text
    keywords = await extract_keywords(text, language)
    
    # Step 3: Cluster keywords
    clusters = await cluster_keywords(keywords, num_clusters, min_keywords)
    
    # Step 4: Generate summary
    summary = await generate_summary(text, clusters, language)
    
    return {
        "clusters": clusters,
        "keywords": keywords,
        "summary": summary,
        "language_detected": language
    }

async def detect_language(text: str) -> str:
    """Detect the language of the input text"""
    
    prompt = f"""
    Detect the language of the following text. Return only the language code (en, es, fr, de, it, pt, nl, etc.).
    
    Text: {text[:500]}...
    
    Language code:
    """
    
    try:
        response = await llm_call(
            model_id="llama3-8b-q4",
            prompt=prompt,
            max_tokens=10,
            temperature=0.1
        )
        
        detected = response.content.strip().lower()
        
        # Validate against supported languages
        supported = ["en", "es", "fr", "de", "it", "pt", "nl"]
        if detected in supported:
            return detected
        else:
            return "en"  # Default to English
            
    except Exception:
        return "en"  # Default to English on error

async def extract_keywords(text: str, language: str) -> List[Dict[str, Any]]:
    """Extract keywords from text using AI"""
    
    language_names = {
        "en": "English",
        "es": "Spanish", 
        "fr": "French",
        "de": "German",
        "it": "Italian",
        "pt": "Portuguese",
        "nl": "Dutch"
    }
    
    lang_name = language_names.get(language, "English")
    
    prompt = f"""
    Extract the most important keywords and phrases from the following {lang_name} text. 
    
    For each keyword, provide:
    1. The keyword/phrase
    2. A relevance score (0-10) 
    3. A brief category/theme
    
    Return the results as a JSON array with this structure:
    [
        {{
            "keyword": "example keyword",
            "relevance": 8.5,
            "category": "theme"
        }}
    ]
    
    Text to analyze:
    {text}
    
    JSON array of keywords:
    """
    
    try:
        response = await llm_call(
            model_id="llama3-8b-q4",
            prompt=prompt,
            max_tokens=800,
            temperature=0.3
        )
        
        # Extract JSON from response
        json_text = extract_json_from_text(response.content)
        keywords = json.loads(json_text)
        
        # Validate and clean keywords
        cleaned_keywords = []
        for kw in keywords:
            if isinstance(kw, dict) and "keyword" in kw:
                cleaned_keywords.append({
                    "keyword": kw.get("keyword", "").strip(),
                    "relevance": float(kw.get("relevance", 0)),
                    "category": kw.get("category", "general").strip()
                })
        
        return cleaned_keywords
        
    except Exception as e:
        # Fallback: simple keyword extraction
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        word_freq = {}
        for word in words:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # Get top words
        top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:20]
        
        return [
            {
                "keyword": word,
                "relevance": min(10, count * 2),
                "category": "general"
            }
            for word, count in top_words
        ]

async def cluster_keywords(keywords: List[Dict[str, Any]], num_clusters: int, min_keywords: int) -> List[Dict[str, Any]]:
    """Cluster keywords into semantic groups"""
    
    if len(keywords) < num_clusters:
        # If we have fewer keywords than clusters, return individual keywords
        return [
            {
                "cluster_id": i,
                "theme": kw["category"],
                "keywords": [kw["keyword"]],
                "relevance_scores": [kw["relevance"]]
            }
            for i, kw in enumerate(keywords)
        ]
    
    keywords_text = ", ".join([kw["keyword"] for kw in keywords])
    
    prompt = f"""
    Group the following keywords into {num_clusters} semantic clusters. Each cluster should contain at least {min_keywords} related keywords.
    
    Keywords: {keywords_text}
    
    For each cluster, provide:
    1. A descriptive theme/topic name
    2. The keywords that belong to this cluster
    3. A brief explanation of why these keywords are grouped together
    
    Return the results as a JSON array with this structure:
    [
        {{
            "theme": "cluster theme",
            "keywords": ["keyword1", "keyword2", "keyword3"],
            "explanation": "brief explanation"
        }}
    ]
    
    JSON array of clusters:
    """
    
    try:
        response = await llm_call(
            model_id="llama3-8b-q4",
            prompt=prompt,
            max_tokens=1000,
            temperature=0.4
        )
        
        # Extract JSON from response
        json_text = extract_json_from_text(response.content)
        clusters_data = json.loads(json_text)
        
        # Process clusters and add relevance scores
        clusters = []
        keyword_lookup = {kw["keyword"]: kw for kw in keywords}
        
        for i, cluster in enumerate(clusters_data):
            if isinstance(cluster, dict) and "keywords" in cluster:
                cluster_keywords = cluster.get("keywords", [])
                relevance_scores = []
                
                for kw in cluster_keywords:
                    if kw in keyword_lookup:
                        relevance_scores.append(keyword_lookup[kw]["relevance"])
                    else:
                        relevance_scores.append(5.0)  # Default relevance
                
                clusters.append({
                    "cluster_id": i,
                    "theme": cluster.get("theme", f"Cluster {i+1}"),
                    "keywords": cluster_keywords,
                    "relevance_scores": relevance_scores,
                    "explanation": cluster.get("explanation", "")
                })
        
        return clusters
        
    except Exception as e:
        # Fallback: simple category-based clustering
        categories = {}
        for kw in keywords:
            cat = kw["category"]
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(kw)
        
        clusters = []
        for i, (theme, kws) in enumerate(categories.items()):
            if len(kws) >= min_keywords:
                clusters.append({
                    "cluster_id": i,
                    "theme": theme,
                    "keywords": [kw["keyword"] for kw in kws],
                    "relevance_scores": [kw["relevance"] for kw in kws],
                    "explanation": f"Keywords related to {theme}"
                })
        
        return clusters[:num_clusters]

async def generate_summary(text: str, clusters: List[Dict[str, Any]], language: str) -> str:
    """Generate a summary of the keyword clustering analysis"""
    
    language_names = {
        "en": "English",
        "es": "Spanish", 
        "fr": "French",
        "de": "German",
        "it": "Italian",
        "pt": "Portuguese",
        "nl": "Dutch"
    }
    
    lang_name = language_names.get(language, "English")
    
    clusters_text = []
    for cluster in clusters:
        theme = cluster["theme"]
        keywords = ", ".join(cluster["keywords"][:5])  # Top 5 keywords
        clusters_text.append(f"- {theme}: {keywords}")
    
    clusters_summary = "\n".join(clusters_text)
    
    prompt = f"""
    Write a concise summary of the keyword analysis for the following {lang_name} text.
    
    The analysis found {len(clusters)} main themes:
    {clusters_summary}
    
    Original text length: {len(text)} characters
    
    Write a 2-3 sentence summary explaining the main topics and themes identified in the text.
    
    Summary:
    """
    
    try:
        response = await llm_call(
            model_id="llama3-8b-q4",
            prompt=prompt,
            max_tokens=200,
            temperature=0.5
        )
        
        return response.content.strip()
        
    except Exception:
        return f"Analysis identified {len(clusters)} main themes from the provided text, covering topics like {', '.join([c['theme'] for c in clusters[:3]])}."

def extract_json_from_text(text: str) -> str:
    """Extract JSON array from text response"""
    
    # Try to find JSON array in the text
    text = text.strip()
    
    # Find the first [ and last ]
    start = text.find('[')
    end = text.rfind(']')
    
    if start != -1 and end != -1 and end > start:
        return text[start:end+1]
    
    # If no array found, try to find JSON object
    start = text.find('{')
    end = text.rfind('}')
    
    if start != -1 and end != -1 and end > start:
        return '[' + text[start:end+1] + ']'
    
    # Return empty array if no JSON found
    return '[]' 