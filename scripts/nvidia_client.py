import os
from openai import OpenAI

def get_nvidia_client():
    api_key = os.environ.get("NVIDIA_API_KEY") or os.environ.get("NVIDIA_NIM_API_KEY")
    base_url = os.environ.get("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
    return OpenAI(base_url=base_url, api_key=api_key)

def run_sample_completion(prompt="Write a limerick about the wonders of GPU computing."):
    client = get_nvidia_client()
    model = os.environ.get("NVIDIA_DEFAULT_MODEL", "nvidia/nemotron-3.5-lightning-30b-a3b")
    
    completion = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=1,
        top_p=0.95,
        max_tokens=16384,
        extra_body={"chat_template_kwargs": {"enable_thinking": True}, "reasoning_budget": 16384},
        stream=True
    )

    for chunk in completion:
        if not chunk.choices:
            continue
        reasoning = getattr(chunk.choices[0].delta, "reasoning_content", None)
        if reasoning:
            print(reasoning, end="")
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="")
    print()

if __name__ == "__main__":
    run_sample_completion()
