import COS from "cos-nodejs-sdk-v5";

function requireCosEnv() {
  const missing = ["COS_SECRET_ID", "COS_SECRET_KEY", "COS_BUCKET", "COS_REGION"].filter(
    (k) => !process.env[k]
  );
  if (missing.length) throw new Error(`Missing COS env: ${missing.join(", ")}`);
}

function getCosClient() {
  requireCosEnv();
  return new COS({
    SecretId: process.env.COS_SECRET_ID!,
    SecretKey: process.env.COS_SECRET_KEY!,
  });
}

export async function uploadToCos(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const cos = getCosClient();
  const key = `uploads/${Date.now()}-${filename}`;

  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: process.env.COS_BUCKET!,
        Region: process.env.COS_REGION!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      },
      (err) => {
        if (err) reject(err);
        else
          resolve(
            `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com/${key}`
          );
      }
    );
  });
}
