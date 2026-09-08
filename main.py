import asyncio
from google.antigravity import Agent, LocalAgentConfig

async def main():
    config = LocalAgentConfig(
        vertex=True
        # Sin api_key aquí; usará la autenticación de gcloud
    )
    async with Agent(config) as agent:
        response = await agent.chat("Hola, preséntate brevemente.")
        async for token in response:
            print(token, end="", flush=True)
        print()

if __name__ == "__main__":
    asyncio.run(main())