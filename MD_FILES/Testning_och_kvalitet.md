# Mina tester

Enhetstesterna finns i `Backend.Tests/ChatControllerTests.cs` och körs från projektroten med `dotnet test`.

- `ChatBot_WithEmptyMessage_ReturnsBadRequest` kontrollerar att ett tomt eller enbart blankt meddelande ger `400 Bad Request`. Testet är viktigt eftersom tomma anrop annars kan använda API-resurser utan att hjälpa användaren.
- `ChatBot_WithTooLongMessage_ReturnsBadRequest` kontrollerar att ett meddelande över 1 000 tecken nekas. Det begränsar mängden data och tokens som kan skickas till AI-tjänsten i ett anrop.
- `NormalizeChatRole_MapsHistoryRolesSafely` körs med rollerna `assistant`, `user` och en okänd roll. Det kontrollerar att giltiga roller behålls och att okända roller behandlas som `user`, så att chatthistoriken får en förutsägbar struktur.

Tester mot själva OpenAI-anropet görs inte som enhetstester, eftersom de skulle kräva en riktig API-nyckel, använda pengar och ge svar som kan variera. I stället testas den egna validerings- och rollhanteringslogiken lokalt.

# Framtids säkring

Chatten är uppdelad i frontend, controller och `ChatService`. Det gör att gränssnittet, API-valideringen och AI-instruktionerna kan ändras var för sig. Gränserna för meddelandelängd och historik ligger samlade i `ChatRequestLimits`, så att de är enkla att ändra och testa.

Nästa rimliga steg är att lagra chatthistorik på servern per användare i stället för att klienten skickar den. Då kan servern säkerställa historikens innehåll och vid behov lägga till olika supportkategorier, ärendesammanfattning och fler kontaktvägar utan att ändra den grundläggande chattfunktionen.

# Säkerhet

OpenAI-nyckeln används endast i backend. Lokalt läses den från .NET User Secrets eller miljövariabeln `OPENAI_API_KEY`; den läggs aldrig i React/Vite-koden, `appsettings.json` eller Git. I produktion ska samma nyckel vara en skyddad miljövariabel eller hämtas från en hemlighetshanterare.

Chatt-API:t kräver en giltig JWT genom `[Authorize]`. API:t begränsar varje inloggad användare till 10 chattanrop per minut och sätter gränser för meddelande, historik och AI-svarets längd. Det minskar risken att någon med ett giltigt konto kan skapa onödiga API-kostnader. Chatboten har inga verktyg eller databasåtkomst och kan därför inte läsa eller ändra bokningar genom ett promptförsök.
