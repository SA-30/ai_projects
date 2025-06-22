# main.py (FastAPI Backend)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import QdrantClient, models
import random
import os
from dotenv import load_dotenv
from constants import GRE_WORDS

load_dotenv()

app = FastAPI()

qdrant_api_key = os.getenv("qdrant_api_key")
qdrant_url = os.getenv("qdrant_url")

# CORS setup (allow Vercel frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
)

# Initialize Qdrant and model
client = QdrantClient(
    url=qdrant_url, 
    api_key=qdrant_api_key,
)

@app.get('/')
async def home():
    return "Home"

@app.on_event("startup")
async def setup_collection():
    # Create the index if it doesn't exist
    try:
        client.create_payload_index(
            collection_name="word_game_full",
            field_name="word",
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        print("Payload index created.")
    except Exception as e:
        print("Index might already exist or error occurred:", e)


@app.get("/generate-game")
async def generate_game():
    # Get total word count from collection info
    collection_info = client.get_collection("word_game_full")
    total_words = collection_info.points_count  # Will be ~400K for full GloVe
    

    # 1. Get random target word
    random_id = random.randint(0, total_words - 1)
    target = client.retrieve(
        collection_name="word_game_full",
        ids=[random_id],
        with_payload=True
    )[0].payload["word"]

    # 2. Find 10 similar words (including target)
    target_vector = client.retrieve(
        collection_name="word_game_full",
        ids=[random_id],
        with_vectors=True
    )[0].vector

    similar_words = client.search(
        collection_name="word_game_full",
        query_vector=target_vector,
        limit=10,  # Exactly 10 words including target
        with_payload=True
    )

    # 3. Prepare game data
    words = [hit.payload["word"] for hit in similar_words]
    random.shuffle(words)  # Important: shuffle the words
    
    return {
        "target": target,  # The correct answer
        "words": words,    # All 10 words (shuffled)
        "hint": f"Starts with '{target[0]}' | {len(target)} letters"
    }

@app.get('/generate-gre-game')
async def generate_gre_game():
    # 1. Pick a random GRE word
    target = random.choice(GRE_WORDS)

    search_result = client.scroll(
        collection_name="word_game_full",
        scroll_filter=models.Filter(
            must=[models.FieldCondition(key="word", match=models.MatchValue(value=target))]
        ),
        with_vectors=True,
        limit=1
    )

    if not search_result or not search_result[0]:
        return {"error": "Target word not found in the collection."}

    target_vector = search_result[0][0].vector

    # 3. Search for similar words (including the target)
    similar_words = client.search(
        collection_name="word_game_full",
        query_vector=target_vector,
        limit=10,  # You can adjust this number
        with_payload=True
    )

    # 4. Prepare game data
    words = [hit.payload["word"] for hit in similar_words]
    random.shuffle(words)

    return {
        "target": target,
        "words": words,
        "hint": f"Starts with '{target[0]}' | {len(target)} letters"
    }
    