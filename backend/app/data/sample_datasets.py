"""
Built-in demo datasets for the Embedding Space Explorer.
Each dataset is a list of dicts with keys: text, label, category.
"""

DATASETS = {
    "semantic_words": {
        "name": "Semantic Word Groups",
        "description": "Animals, fruits, vehicles, emotions, professions — tests whether embeddings cluster by semantic category.",
        "items": [
            # Animals
            {"text": "dog", "label": "dog", "category": "animal"},
            {"text": "cat", "label": "cat", "category": "animal"},
            {"text": "wolf", "label": "wolf", "category": "animal"},
            {"text": "lion", "label": "lion", "category": "animal"},
            {"text": "elephant", "label": "elephant", "category": "animal"},
            {"text": "dolphin", "label": "dolphin", "category": "animal"},
            # Fruits
            {"text": "apple", "label": "apple", "category": "fruit"},
            {"text": "banana", "label": "banana", "category": "fruit"},
            {"text": "mango", "label": "mango", "category": "fruit"},
            {"text": "strawberry", "label": "strawberry", "category": "fruit"},
            {"text": "orange", "label": "orange", "category": "fruit"},
            {"text": "grape", "label": "grape", "category": "fruit"},
            # Vehicles
            {"text": "car", "label": "car", "category": "vehicle"},
            {"text": "truck", "label": "truck", "category": "vehicle"},
            {"text": "bicycle", "label": "bicycle", "category": "vehicle"},
            {"text": "airplane", "label": "airplane", "category": "vehicle"},
            {"text": "motorcycle", "label": "motorcycle", "category": "vehicle"},
            {"text": "helicopter", "label": "helicopter", "category": "vehicle"},
            # Emotions
            {"text": "happy", "label": "happy", "category": "emotion"},
            {"text": "sad", "label": "sad", "category": "emotion"},
            {"text": "angry", "label": "angry", "category": "emotion"},
            {"text": "fearful", "label": "fearful", "category": "emotion"},
            {"text": "surprised", "label": "surprised", "category": "emotion"},
            {"text": "disgusted", "label": "disgusted", "category": "emotion"},
            # Professions
            {"text": "doctor", "label": "doctor", "category": "profession"},
            {"text": "engineer", "label": "engineer", "category": "profession"},
            {"text": "teacher", "label": "teacher", "category": "profession"},
            {"text": "lawyer", "label": "lawyer", "category": "profession"},
            {"text": "artist", "label": "artist", "category": "profession"},
            {"text": "scientist", "label": "scientist", "category": "profession"},
        ],
    },

    "similar_sentences": {
        "name": "Sentence Similarity Pairs",
        "description": "Paraphrase pairs and unrelated sentences — shows semantic similarity between sentences.",
        "items": [
            {"text": "The dog is running in the park.", "label": "dog-run", "category": "animals-action"},
            {"text": "A puppy is playing outside.", "label": "puppy-play", "category": "animals-action"},
            {"text": "A canine sprints through the garden.", "label": "canine-sprint", "category": "animals-action"},
            {"text": "The cat is sleeping on the sofa.", "label": "cat-sleep", "category": "animals-rest"},
            {"text": "A kitten is napping on the couch.", "label": "kitten-nap", "category": "animals-rest"},
            {"text": "The stock market crashed yesterday.", "label": "market-crash", "category": "finance"},
            {"text": "Investors lost billions in the financial collapse.", "label": "investors-loss", "category": "finance"},
            {"text": "Tech companies reported record profits.", "label": "tech-profit", "category": "finance"},
            {"text": "I love eating pizza on Friday nights.", "label": "pizza-friday", "category": "food"},
            {"text": "My favourite meal is pasta with tomato sauce.", "label": "pasta-fav", "category": "food"},
            {"text": "The restaurant serves amazing Italian food.", "label": "italian-food", "category": "food"},
            {"text": "Machine learning models require large datasets.", "label": "ml-data", "category": "ai"},
            {"text": "Deep neural networks need vast amounts of training data.", "label": "nn-training", "category": "ai"},
            {"text": "AI systems improve performance with more examples.", "label": "ai-improve", "category": "ai"},
            {"text": "The weather is warm and sunny today.", "label": "weather-sunny", "category": "weather"},
            {"text": "It is a bright and pleasant afternoon.", "label": "afternoon-bright", "category": "weather"},
            {"text": "Heavy rainfall is expected this weekend.", "label": "rain-weekend", "category": "weather"},
        ],
    },

    "context_shift": {
        "name": "Context-Shift (Word Sense)",
        "description": "The same word in different contexts — demonstrates how contextual embeddings (MiniLM/MPNet) shift in space while static embeddings (GloVe) stay fixed.",
        "items": [
            {"text": "I deposited money at the bank.", "label": "bank (finance)", "category": "bank-finance"},
            {"text": "The bank raised its interest rates.", "label": "bank (rates)", "category": "bank-finance"},
            {"text": "We sat on the grassy bank of the river.", "label": "bank (river)", "category": "bank-river"},
            {"text": "The river bank was covered in wildflowers.", "label": "bank (shore)", "category": "bank-river"},
            {"text": "The pilot landed on the left bank of the valley.", "label": "bank (valley)", "category": "bank-geography"},
            {"text": "Apple released a new iPhone model.", "label": "Apple (tech)", "category": "apple-tech"},
            {"text": "Apple announced record quarterly earnings.", "label": "Apple (earnings)", "category": "apple-tech"},
            {"text": "I ate a crisp red apple for breakfast.", "label": "apple (fruit)", "category": "apple-fruit"},
            {"text": "The apple tree in our garden is blooming.", "label": "apple (tree)", "category": "apple-fruit"},
            {"text": "The Python program executed in 2 seconds.", "label": "Python (code)", "category": "python-code"},
            {"text": "We wrote a Python script to parse the JSON.", "label": "Python (script)", "category": "python-code"},
            {"text": "A Python snake can grow up to 6 metres long.", "label": "python (snake)", "category": "python-animal"},
            {"text": "The python coiled around the branch silently.", "label": "python (coil)", "category": "python-animal"},
        ],
    },

    "ai_documents": {
        "name": "AI Topic Chunks",
        "description": "Short paragraphs from different AI topics — simulates document-level embedding for RAG-style use cases.",
        "items": [
            {"text": "Transformers use self-attention to weigh the importance of each word in context, enabling them to capture long-range dependencies in text.", "label": "Transformer attention", "category": "transformers"},
            {"text": "BERT is a bidirectional transformer model pre-trained on masked language modelling and next sentence prediction tasks.", "label": "BERT", "category": "transformers"},
            {"text": "GPT models are autoregressive transformers that predict the next token given all previous tokens in the sequence.", "label": "GPT", "category": "transformers"},
            {"text": "Reinforcement learning trains agents by rewarding desirable behaviours and penalising undesirable ones over many environment interactions.", "label": "RL basics", "category": "reinforcement-learning"},
            {"text": "Q-learning is a model-free reinforcement learning algorithm that learns the value of state-action pairs directly from experience.", "label": "Q-learning", "category": "reinforcement-learning"},
            {"text": "Proximal Policy Optimisation (PPO) is a popular actor-critic RL algorithm used to train large language models via RLHF.", "label": "PPO / RLHF", "category": "reinforcement-learning"},
            {"text": "Convolutional neural networks apply learned filters across spatial dimensions, making them highly effective for image recognition tasks.", "label": "CNN", "category": "computer-vision"},
            {"text": "Object detection models like YOLO predict bounding boxes and class probabilities in a single forward pass.", "label": "YOLO", "category": "computer-vision"},
            {"text": "Vision Transformers (ViT) divide images into patches and process them as sequences, achieving state-of-the-art results on benchmarks.", "label": "ViT", "category": "computer-vision"},
            {"text": "Retrieval-Augmented Generation (RAG) combines a retrieval system with a generative model to ground responses in external knowledge.", "label": "RAG", "category": "rag"},
            {"text": "In a RAG pipeline, documents are chunked, embedded, stored in a vector database, and retrieved at query time using semantic search.", "label": "RAG pipeline", "category": "rag"},
            {"text": "Vector databases like Pinecone, Weaviate, and ChromaDB store embeddings and support approximate nearest-neighbour search at scale.", "label": "Vector DBs", "category": "rag"},
            {"text": "Neural networks learn by adjusting weights through backpropagation to minimise a loss function using gradient descent.", "label": "Backprop", "category": "fundamentals"},
            {"text": "Overfitting occurs when a model memorises training data and fails to generalise to new examples.", "label": "Overfitting", "category": "fundamentals"},
            {"text": "Batch normalisation stabilises training by normalising layer inputs, reducing internal covariate shift.", "label": "BatchNorm", "category": "fundamentals"},
        ],
    },
}


def get_dataset(name: str):
    return DATASETS.get(name)


def list_datasets() -> list:
    return [
        {
            "key": k,
            "name": v["name"],
            "description": v["description"],
            "count": len(v["items"]),
        }
        for k, v in DATASETS.items()
    ]
