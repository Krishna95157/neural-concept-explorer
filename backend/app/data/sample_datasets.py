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

    "ai_knowledge_graph": {
        "name": "AI Knowledge Graph Corpus",
        "description": "Rich AI/ML paragraphs curated to demonstrate entity extraction, graph edges, and semantic clustering across key AI concepts.",
        "items": [
            {"text": "The Transformer architecture introduced self-attention, allowing each token to attend to all other tokens in the sequence. This replaced recurrent networks like LSTM and GRU, enabling parallelisation during training.", "label": "Transformer intro", "category": "architecture"},
            {"text": "BERT is a bidirectional encoder trained with masked language modelling on large text corpora. It uses the Transformer encoder and fine-tuning on downstream tasks like NER and question answering.", "label": "BERT", "category": "architecture"},
            {"text": "GPT models are autoregressive Transformers that use the decoder to predict the next token. GPT-3 and GPT-4 scale this to hundreds of billions of parameters using deep learning on internet-scale text.", "label": "GPT", "category": "architecture"},
            {"text": "Embeddings map words or sentences to dense vector representations in a high-dimensional space. Cosine similarity measures the angle between embedding vectors, revealing semantic closeness.", "label": "Embeddings", "category": "representations"},
            {"text": "RAG, or Retrieval Augmented Generation, combines a retrieval system with a generative model. Documents are embedded and stored in a vector database. At query time, relevant chunks are retrieved and passed to the LLM.", "label": "RAG", "category": "retrieval"},
            {"text": "Vector databases like Pinecone, Weaviate, and ChromaDB store embeddings and support approximate nearest-neighbour search using FAISS or HNSW indices.", "label": "Vector DB", "category": "retrieval"},
            {"text": "Tokenization converts raw text into tokens that models can process. BERT uses WordPiece tokenization, GPT-2 uses BPE, and both produce subword tokens that handle out-of-vocabulary words.", "label": "Tokenization", "category": "preprocessing"},
            {"text": "Knowledge graphs represent entities as nodes and relationships as edges. They enable structured reasoning over symbolic information, complementing the vector representations used by neural networks.", "label": "Knowledge Graphs", "category": "knowledge"},
            {"text": "Reinforcement learning from human feedback, or RLHF, fine-tunes language models using PPO. A reward model is trained on human preferences and used to guide the LLM policy update.", "label": "RLHF", "category": "training"},
            {"text": "Attention in the Transformer computes query, key, and value projections. The dot-product attention score is scaled by the square root of the key dimension and passed through a softmax to produce weights.", "label": "Attention mechanism", "category": "architecture"},
            {"text": "PCA reduces embedding dimensionality by projecting onto principal components. t-SNE and UMAP are non-linear reduction techniques better suited for visualising cluster structure in high-dimensional spaces.", "label": "Dimensionality reduction", "category": "visualisation"},
            {"text": "Fine-tuning adapts a pre-trained model like BERT or GPT to a specific task. Only the task-specific head and optionally a few upper layers are updated, reducing compute compared to training from scratch.", "label": "Fine-tuning", "category": "training"},
            {"text": "Convolutional neural networks apply learned filters over spatial inputs. YOLO uses a CNN backbone for real-time object detection, while ViT replaces convolutions with self-attention over image patches.", "label": "CNN vs ViT", "category": "vision"},
            {"text": "Backpropagation computes gradients through the neural network using the chain rule. The Adam optimiser combines momentum and adaptive learning rates to update weights efficiently.", "label": "Training basics", "category": "training"},
            {"text": "LangChain and LlamaIndex are frameworks for building LLM applications. They simplify connecting language models to tools, memory, and retrieval systems, enabling RAG pipelines and agents.", "label": "LLM frameworks", "category": "tooling"},
            {"text": "Overfitting occurs when a model memorises training data and fails to generalise. Regularisation techniques like dropout, weight decay, and layer normalisation help reduce overfitting.", "label": "Overfitting", "category": "fundamentals"},
            {"text": "Sentence-transformers is a HuggingFace library for computing sentence embeddings using MiniLM, MPNet, and other models. It supports semantic search, clustering, and paraphrase detection.", "label": "Sentence Transformers", "category": "tooling"},
            {"text": "Diffusion models learn to reverse a noisy process step by step. They have achieved state-of-the-art results in image generation, outperforming GANs in diversity and stability.", "label": "Diffusion models", "category": "generative"},
            {"text": "spaCy performs named entity recognition using a CNN-based model trained on annotated corpora. It can identify organisations, people, products, and locations in raw text.", "label": "spaCy NER", "category": "tooling"},
            {"text": "FAISS is a library for efficient similarity search over dense vectors. It supports approximate nearest-neighbour search using inverted file indices and product quantisation, scaling to billions of vectors.", "label": "FAISS", "category": "retrieval"},
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
