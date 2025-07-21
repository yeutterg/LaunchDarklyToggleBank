#!/usr/bin/env node

// Simple test script to verify AWS Bedrock configuration
const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");

async function testBedrock() {
    console.log("Testing AWS Bedrock configuration...\n");

    // Check environment variables
    const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_DEFAULT_REGION'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error("❌ Missing required environment variables:");
        missingVars.forEach(varName => console.error(`   - ${varName}`));
        console.log("\nPlease set these variables in your .env file or environment.");
        return;
    }

    console.log("✅ Environment variables found:");
    console.log(`   - AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID.substring(0, 10)}...`);
    console.log(`   - AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY.substring(0, 10)}...`);
    console.log(`   - AWS_DEFAULT_REGION: ${process.env.AWS_DEFAULT_REGION}`);

    try {
        // Create Bedrock client
        const client = new BedrockRuntimeClient({
            region: process.env.AWS_DEFAULT_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });

        console.log("\n🔄 Testing Bedrock connection...");

        // Test with a simple prompt
        const command = new ConverseCommand({
            modelId: "anthropic.claude-instant-v1",
            messages: [
                {
                    role: "user",
                    content: [{ text: "Hello, can you respond with just 'OK'?" }]
                }
            ],
            inferenceConfig: {
                temperature: 0.1,
                maxTokens: 10,
            },
        });

        const response = await client.send(command);
        const responseText = response.output?.message?.content?.[0]?.text;

        if (responseText) {
            console.log("✅ Bedrock connection successful!");
            console.log(`   Response: "${responseText.trim()}"`);
        } else {
            console.log("⚠️  Bedrock connected but no response received");
        }

    } catch (error) {
        console.error("❌ Bedrock connection failed:");
        console.error(`   Error: ${error.message}`);
        
        if (error.name === 'UnauthorizedOperation') {
            console.error("\n💡 This usually means:");
            console.error("   - Your AWS credentials don't have Bedrock permissions");
            console.error("   - Your AWS account doesn't have access to Bedrock");
            console.error("   - You need to request access to Bedrock in the AWS console");
        } else if (error.name === 'InvalidSignatureException') {
            console.error("\n💡 This usually means:");
            console.error("   - Your AWS credentials are incorrect");
            console.error("   - Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY");
        } else if (error.name === 'ResourceNotFoundException') {
            console.error("\n💡 This usually means:");
            console.error("   - The model ID is not available in your region");
            console.error("   - Try changing AWS_DEFAULT_REGION to us-west-2 or us-east-1");
        }
    }
}

// Run the test
testBedrock().catch(console.error); 