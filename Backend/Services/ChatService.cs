using OpenAI.Responses;
#pragma warning disable OPENAI001

namespace Backend.Services;

public class ChatService(){
    public async Task<string> ChatBot (string message)
    {
	string key = Environment.GetEnvironmentVariable ("OPENAI_API_KEY")!;	
	ResponsesClient client = new(key);
	
	CreateResponseOptions options = new(){
	    Model = "gpt-6.1-sol",
	    Instructions = """
		
		"""
	};

	return "";
    }
}
