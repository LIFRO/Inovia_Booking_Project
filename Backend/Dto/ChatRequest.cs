public record ChatMessage(string Role, string Message);

public record ChatRequest(string Message, List<ChatMessage> History);

public static class ChatRequestLimits
{
    public const int MaxMessageLength = 1_000;
    public const int MaxHistoryMessages = 20;
}
