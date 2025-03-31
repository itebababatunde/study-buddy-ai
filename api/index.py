from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.logger import logger
import os
import sys

# Add the `api` directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


from api.processor.chatbot import ChatbotManager
from processor.embeddings import EmbeddingsManager  # Import the EmbeddingsManager
embeddings_manager = EmbeddingsManager(
    model_name="BAAI/bge-small-en",
    device="cpu",
    encode_kwargs={"normalize_embeddings": True},
    qdrant_url="http://localhost:6333",
    collection_name="vector_db" )

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with your frontend's URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}

# Define the upload directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    logger.info('got upload request ')
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as f:
        f.write(await file.read())
    # Call the create_embeddings method
    try:
        result = embeddings_manager.create_embeddings(file_location)
        logger.info(result)

    except Exception as e:
        logger.error(f"Error creating embeddings: {e}")
        return {"message": "Failed to process the file", "error": str(e)}
    
    
    
     # Initialize the ChatbotManager
    try:
        chatbot_manager = ChatbotManager(
            model_name="BAAI/bge-small-en",
            device="cpu",
            encode_kwargs={"normalize_embeddings": True},
            llm_model="llama3.2:3b",
            llm_temperature=0.7,
            qdrant_url="http://localhost:6333",
            collection_name="vector_db"
        )

        # Ask a sample question
        sample_question = "What is blockchain?"

        chatbot_response = chatbot_manager.get_response(sample_question)
    except Exception as e:
        logger.error(f"Error initializing chatbot or processing query: {e}")
        return {"message": "Failed to initialize chatbot or process query", "error": str(e)}

    return {"message": "File uploaded and processed successfully", "filePath": file_location, "result": result}