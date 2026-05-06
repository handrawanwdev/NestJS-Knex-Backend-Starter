const { S3Client, HeadBucketCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config();

const S3_ENDPOINT = process.env.S3_ENDPOINT || 'https://objectstorage.biznetgio.com';
const S3_BUCKET_KEY = process.env.S3_BUCKET_KEY;
const S3_BUCKET_SECRET = process.env.S3_BUCKET_SECRET;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_BUCKET_REGION = process.env.S3_BUCKET_REGION || 'id-nss-1';

if (!S3_BUCKET_KEY || !S3_BUCKET_SECRET || !S3_BUCKET_NAME) {
  console.error('❌ Missing required S3 environment variables:');
  console.error('   - S3_BUCKET_KEY');
  console.error('   - S3_BUCKET_SECRET');
  console.error('   - S3_BUCKET_NAME');
  console.error('\n   Please copy .env to .env and fill in the values.');
  process.exit(1);
}

async function checkS3Key() {
  console.log('🔍 Checking S3 credentials...\n');
  console.log(`   Endpoint: ${S3_ENDPOINT}`);
  console.log(`   Bucket:   ${S3_BUCKET_NAME}`);
  console.log(`   Region:   ${S3_BUCKET_REGION}`);
  console.log(`   Key:      ${S3_BUCKET_KEY?.slice(0, 8)}...`);
  console.log('');
  
  const result = await tryEndpoint(S3_ENDPOINT);
  if (!result) {
    console.log('\n❌ S3 credential check failed.\n');
    return false;
  }
  return true;
}

async function tryEndpoint(endpoint) {
  // Create S3 client with custom endpoint for BiznetGIO
  const s3Client = new S3Client({
    region: S3_BUCKET_REGION,
    endpoint: endpoint,
    credentials: {
      accessKeyId: S3_BUCKET_KEY,
      secretAccessKey: S3_BUCKET_SECRET
    },
    forcePathStyle: true  // Use path-style URLs (required for most S3-compatible services)
  });
  
  try {
    console.log('📡 Sending HeadBucket request...\n');
    
    // Try HEAD bucket request first (simpler)
    const headCommand = new HeadBucketCommand({ Bucket: S3_BUCKET_NAME });
    await s3Client.send(headCommand);
    
    console.log('✅ S3 credentials are VALID!');
    console.log('   Connection successful. Bucket is accessible.\n');
    
    // Try to list objects to further verify access
    try {
      console.log('📡 Verifying read access (listing objects)...\n');
      const listCommand = new ListObjectsV2Command({ 
        Bucket: S3_BUCKET_NAME,
        MaxKeys: 1
      });
      const listResult = await s3Client.send(listCommand);
      
      console.log('✅ Read access verified!');
      console.log(`   Objects in bucket: ${listResult.KeyCount || 0}\n`);
    } catch (listError) {
      console.log('⚠️  Read access limited (HEAD succeeded but LIST failed)');
      console.log(`   ${listError.message}\n`);
    }
    
    return true;
    
  } catch (error) {
    if (error.name === 'NoSuchBucket' || error.$metadata?.httpStatusCode === 404) {
      console.log('❌ S3 bucket not found!');
      console.log(`   Error: The bucket "${S3_BUCKET_NAME}" does not exist at this endpoint.\n`);
      console.log('   Troubleshooting steps:');
      console.log('   1. Check S3_BUCKET_NAME spelling');
      console.log('   2. Verify bucket exists in BiznetGIO portal');
      console.log('   3. Ensure endpoint matches bucket\'s region\n');
      return false;
    } else if (error.name === 'AccessDenied' || error.$metadata?.httpStatusCode === 403) {
      console.log('❌ S3 credentials are INVALID!');
      console.log('   Error 403: Access Denied.\n');
      console.log('   Troubleshooting steps:');
      console.log('   1. Verify S3_BUCKET_KEY and S3_BUCKET_SECRET in BiznetGIO portal');
      console.log('   2. Ensure bucket exists and credentials have access');
      console.log('   3. Check if endpoint matches your bucket\'s region\n');
      return false;
    } else if (error.name === 'NetworkingError') {
      console.log('❌ Connection failed!');
      console.log(`   Error: ${error.message}\n`);
      return false;
    } else {
      console.log('❌ Unexpected error!');
      console.log(`   Error: ${error.message}`);
      console.log(`   Status Code: ${error.$metadata?.httpStatusCode || 'N/A'}`);
      console.log('');
      return false;
    }
  }
}

checkS3Key();
