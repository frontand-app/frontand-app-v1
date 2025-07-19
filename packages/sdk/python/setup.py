"""
Setup configuration for CLOSED AI Python SDK
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="closedai",
    version="1.0.0",
    author="CLOSED AI Team",
    author_email="team@closedai.com",
    description="CLOSED AI Python SDK for building and running automation flows",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/closedai/sdk",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Internet :: WWW/HTTP :: HTTP Servers",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    python_requires=">=3.8",
    install_requires=[
        "httpx>=0.24.0",
        "tiktoken>=0.4.0",
        "pydantic>=2.0.0",
        "aiofiles>=23.0.0",
        "python-dotenv>=1.0.0",
    ],
    extras_require={
        "openai": ["openai>=1.0.0"],
        "anthropic": ["anthropic>=0.3.0"],
        "google": ["google-generativeai>=0.3.0"],
        "modal": ["modal>=0.55.0"],
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "isort>=5.0.0",
            "flake8>=6.0.0",
            "mypy>=1.0.0",
        ],
        "all": [
            "openai>=1.0.0",
            "anthropic>=0.3.0",
            "google-generativeai>=0.3.0",
            "modal>=0.55.0",
        ]
    },
    entry_points={
        "console_scripts": [
            "closedai=closedai.cli:main",
        ],
    },
    include_package_data=True,
    package_data={
        "closedai": ["data/*.json"],
    },
) 