#!/usr/bin/env node

// Script to validate AWS credentials
const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");

async function validateAWSCredentials() {
    console.log("🔍 Validating AWS Credentials...\n");

    // Check environment variables
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const sessionToken = process.env.AWS_SESSION_TOKEN;
    const region = process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION;

    if (!accessKeyId || !secretAccessKey) {
        console.error("❌ Missing AWS credentials:");
        console.error(`   - AWS_ACCESS_KEY_ID: ${accessKeyId ? 'SET' : 'MISSING'}`);
        console.error(`   - AWS_SECRET_ACCESS_KEY: ${secretAccessKey ? 'SET' : 'MISSING'}`);
        console.log("\n💡 Please set these in your .env file");
        return;
    }

    console.log("✅ AWS credentials found:");
    console.log(`   - Access Key ID: ${accessKeyId.substring(0, 10)}...`);
    console.log(`   - Secret Access Key: ${secretAccessKey.substring(0, 10)}...`);
    console.log(`   - Region: ${region || 'NOT SET'}`);

    // Check if credentials are temporary
    if (accessKeyId.startsWith('ASIA')) {
        console.log("\nℹ️  Using temporary AWS credentials (ASIA prefix)");
        console.log("   Make sure you have AWS_SESSION_TOKEN set in your .env file");
        
        if (!process.env.AWS_SESSION_TOKEN) {
            console.warn("⚠️  WARNING: AWS_SESSION_TOKEN is not set!");
            console.warn("   Temporary credentials require a session token.");
            console.log("\n💡 Add AWS_SESSION_TOKEN to your .env file");
        }
    }

    // Test credentials with STS
    try {
        console.log("\n🔄 Testing AWS credentials...");
        
        const stsClient = new STSClient({
            region: region || 'us-east-1',
            credentials: {
                accessKeyId,
                secretAccessKey,
                sessionToken,
            },
        });

        const command = new GetCallerIdentityCommand({});
        const response = await stsClient.send(command);

        console.log("✅ AWS credentials are valid!");
        console.log(`   - Account ID: ${response.Account}`);
        console.log(`   - User ID: ${response.UserId}`);
        console.log(`   - ARN: ${response.Arn}`);

        // Check if user has Bedrock permissions
        console.log("\n🔄 Checking Bedrock permissions...");
        
        const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");
        const bedrockClient = new BedrockRuntimeClient({
            region: region || 'us-east-1',
            credentials: {
                accessKeyId,
                secretAccessKey,
                sessionToken,
            },
        });

        // Try a simple Bedrock call
        const bedrockCommand = new ConverseCommand({
            modelId: "anthropic.claude-instant-v1",
            messages: [
                {
                    role: "user",
                    content: [{ text: "Hello" }]
                }
            ],
            inferenceConfig: {
                temperature: 0.1,
                maxTokens: 10,
            },
        });

        await bedrockClient.send(bedrockCommand);
        console.log("✅ Bedrock access confirmed!");

    } catch (error) {
        console.error("❌ AWS credentials validation failed:");
        console.error(`   Error: ${error.message}`);
        
        if (error.name === 'UnrecognizedClientException' || error.message.includes('security token')) {
            console.error("\n💡 This means your AWS credentials are invalid or expired.");
            console.error("   Please update your .env file with valid credentials.");
        } else if (error.name === 'AccessDeniedException') {
            console.error("\n💡 Your AWS user doesn't have Bedrock permissions.");
            console.error("   Please attach the 'AmazonBedrockFullAccess' policy to your IAM user.");
        } else if (error.name === 'ResourceNotFoundException') {
            console.error("\n💡 The Bedrock model is not available in your region.");
            console.error("   Try setting AWS_DEFAULT_REGION to us-west-2 or us-east-1");
        }
    }
}

// Run validation
validateAWSCredentials().catch(console.error); 