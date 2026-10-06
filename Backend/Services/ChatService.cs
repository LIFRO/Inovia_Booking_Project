using OpenAI.Responses;
#pragma warning disable OPENAI001

namespace backend.Services;

public class ChatService(){
	string key = Environment.GetEnvironmentVariable ("OPENAI_API_KEY")!;	
	ResponsesClient client = new(key);
}
