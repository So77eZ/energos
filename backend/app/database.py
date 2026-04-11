from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
)
import uuid
import boto3
from fastapi import HTTPException, UploadFile

from config import settings


DATABASE_URL = settings.DB_URL
engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.SUPABASE_ACCESS_KEY,
    aws_secret_access_key=settings.SUPABASE_SECRET_KEY,
    endpoint_url=f"{settings.SUPABASE_URL}/storage/v1/s3",
    region_name=settings.SUPABASE_REGION,
)


class SupabaseService:
    @staticmethod
    async def upload_image(file: UploadFile) -> str:
        content = await file.read()
        file_name = f"{uuid.uuid4()}_{file.filename}"
        try:
            s3_client.put_object(
                Bucket=settings.SUPABASE_BUCKET_NAME,
                Key=file_name,
                Body=content,
                ContentType=file.content_type or "application/octet-stream",
            )
            url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_BUCKET_NAME}/{file_name}"
            return url
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to upload image: {str(e)}"
            )

    @staticmethod
    def delete_image(image_url: str):
        if not image_url:
            return
        prefix = f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_BUCKET_NAME}/"
        if image_url.startswith(prefix):
            key = image_url[len(prefix) :]
            try:
                s3_client.delete_object(Bucket=settings.SUPABASE_BUCKET_NAME, Key=key)
            except Exception as e:
                print(f"Failed to delete image {key}: {str(e)}")
