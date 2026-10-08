public record ChatMessage(string Role, string Message);

public record ChatRequest(string Message, List<ChatMessage> History);
