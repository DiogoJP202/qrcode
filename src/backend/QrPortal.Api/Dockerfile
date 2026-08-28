FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY QrPortal.sln Directory.Build.props ./
COPY src/backend/QrPortal.Api/QrPortal.Api.csproj src/backend/QrPortal.Api/
COPY src/backend/QrPortal.Application/QrPortal.Application.csproj src/backend/QrPortal.Application/
COPY src/backend/QrPortal.Domain/QrPortal.Domain.csproj src/backend/QrPortal.Domain/
COPY src/backend/QrPortal.Infrastructure/QrPortal.Infrastructure.csproj src/backend/QrPortal.Infrastructure/
RUN dotnet restore src/backend/QrPortal.Api/QrPortal.Api.csproj
COPY src/backend src/backend
RUN dotnet publish src/backend/QrPortal.Api/QrPortal.Api.csproj -c Release --no-restore -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build --chown=app:app /app/publish .
USER app
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "QrPortal.Api.dll"]
