import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { AppSyncResolverHandler } from "aws-lambda"

const client = new S3Client({
  region: process.env.REGION,
})

const getPresignedUrl = async (
  bucket: string,
  key: string,
  expiresIn: number
): Promise<string> => {
  const objectParams = {
    Bucket: bucket,
    Key: key,
  }
  const signedUrl = await getSignedUrl(
    client,
    new PutObjectCommand(objectParams),
    { expiresIn }
  )
  console.log(signedUrl)
  return signedUrl
}

export const handler: AppSyncResolverHandler<any, any> = async (event) => {
  const file_name = event.arguments.filename
  const id = event.arguments.id
  console.log(event)
  console.log(file_name)
  const { REGION, BUCKET, EXPIRES_IN } = process.env

  if (!REGION || !BUCKET || !EXPIRES_IN || isNaN(Number(EXPIRES_IN))) {
    throw new Error("invalid environment values")
  }

  const expiresIn = Number(EXPIRES_IN)
  const key = `files/${id}/${file_name}`
  console.log(BUCKET)
  console.log(expiresIn)
  console.log(key)

  const url = await getPresignedUrl(BUCKET, key, expiresIn)

  return {
    bucket: BUCKET,
    key: `https://${key}`,
    presignedUrl: url,
  }
}
