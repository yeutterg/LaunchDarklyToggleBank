import { NextApiRequest, NextApiResponse } from "next";
import { getServerClient } from "@/utils/ld-server";
import { LDClient, LDSingleKindContext } from "@launchdarkly/node-server-sdk";
import { getCookie } from "cookies-next";
import { LD_CONTEXT_COOKIE_KEY } from "@/utils/constants";
import { v4 as uuidv4 } from "uuid";

export default async function hallucinationChatResponse(req: NextApiRequest, res: NextApiResponse) {
    try {
        const ldClient: LDClient = await getServerClient(process.env.LD_SDK_KEY || "");
        const context: LDSingleKindContext = clientSideContext({ req, res }) || {
            kind: "user",
            key: uuidv4() 
        };

        const body = JSON.parse(req.body);
        const userInput: string = body?.userInput;
        const aiConfigKey: string = body?.aiConfigKey;

        if (!userInput) {
            return res.status(400).json({ 
                error: "userInput is required",
                response: "I'm sorry. Please provide a message.",
                modelName: "hallucination-tracker",
                enabled: true
            });
        }

        // Prepare the request for the hallucination tracker
        const hallucinationRequest = {
            message: userInput,
            context: context,
            configKey: aiConfigKey,
            // Add any additional parameters the hallucination tracker expects
            timestamp: new Date().toISOString(),
            sessionId: context.key
        };

        // Make request to the hallucination tracker service
        const hallucinationResponse = await fetch('http://hallucination-tracker:8501/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(hallucinationRequest),
        });

        if (!hallucinationResponse.ok) {
            console.error('Hallucination tracker error:', hallucinationResponse.status, hallucinationResponse.statusText);
            throw new Error(`Hallucination tracker returned ${hallucinationResponse.status}`);
        }

        const hallucinationData = await hallucinationResponse.json();

        // Track the interaction with LaunchDarkly
        ldClient?.track('chatbot_interaction', context, {
            model: 'hallucination-tracker',
            input_length: userInput.length,
            response_length: hallucinationData.response?.length || 0,
            hallucination_score: hallucinationData.hallucination_score || 0,
            confidence_score: hallucinationData.confidence_score || 0,
            fact_check_passed: hallucinationData.fact_check_passed || false
        });

        ldClient?.flush();

        const response = {
            response: hallucinationData.response || "I'm sorry. Please try again.",
            modelName: "hallucination-tracker",
            enabled: true,
            hallucination_score: hallucinationData.hallucination_score,
            confidence_score: hallucinationData.confidence_score,
            fact_check_passed: hallucinationData.fact_check_passed,
            sources: hallucinationData.sources || [],
            warnings: hallucinationData.warnings || []
        };

        res.status(200).json(response);

    } catch (error) {
        console.error("Error in hallucination chat:", error);
        
        let errorMessage = "Internal Server Error";
        if (error instanceof Error) {
            if (error.message.includes("fetch")) {
                errorMessage = "Hallucination tracker service unavailable";
            } else {
                errorMessage = error.message;
            }
        }
        
        res.status(500).json({ 
            error: errorMessage,
            response: "I'm sorry. The advanced chatbot service is currently unavailable. Please try again later.",
            modelName: "hallucination-tracker",
            enabled: false
        });
    }
}

const clientSideContext = ({
    res,
    req,
}: {
    res: NextApiResponse;
    req: NextApiRequest;
}): LDSingleKindContext => JSON.parse(getCookie(LD_CONTEXT_COOKIE_KEY, { res, req }) || "{}"); 