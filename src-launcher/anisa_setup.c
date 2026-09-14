#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <windows.h>
#include <shellapi.h>

void print_banner() {
    system("cls");
    printf("===============================================================\n");
    printf("        ANISA AI ASSISTANT - WINDOWS SETUP & LAUNCHER          \n");
    printf("===============================================================\n");
    printf("  Personal Voice Assistant powered by Gemini Live API\n");
    printf("===============================================================\n\n");
}

int is_node_installed() {
    int res = system("where node >nul 2>nul");
    return (res == 0);
}

void open_browser_delayed() {
    // Launch browser to http://localhost:3000 after 3 seconds in background
    system("start \"\" cmd /c \"timeout /t 3 /nobreak >nul & start http://localhost:3000\"");
}

int main() {
    SetConsoleTitleA("Anisa AI Assistant - PC Setup & Launcher");
    print_banner();

    // 1. Verify Node.js
    printf("[1/5] Checking Node.js installation...\n");
    if (!is_node_installed()) {
        printf("\n[ERROR] Node.js is NOT installed on this computer!\n");
        printf("Anisa AI requires Node.js (v18 or higher) to run.\n");
        printf("\nOpening https://nodejs.org/ in your web browser...\n");
        ShellExecuteA(NULL, "open", "https://nodejs.org/", NULL, NULL, SW_SHOWNORMAL);
        printf("Please install Node.js, restart this app, and try again.\n\n");
        system("pause");
        return 1;
    }
    printf("      Node.js is detected: ");
    system("node -v");
    printf("\n");

    // 2. Setup .env file
    printf("[2/5] Checking configuration (.env file)...\n");
    FILE *env_file = fopen(".env", "r");
    if (!env_file) {
        printf("      Creating .env file from .env.example...\n");
        system("copy .env.example .env >nul");
        printf("      .env created successfully.\n\n");
        
        printf("===============================================================\n");
        printf("  ACTION REQUIRED: Set your GEMINI_API_KEY\n");
        printf("  You can get a free key from: https://aistudio.google.com/\n");
        printf("===============================================================\n\n");
        
        printf("Opening .env in Notepad now. Paste your GEMINI_API_KEY, save, and close Notepad.\n");
        system("notepad .env");
    } else {
        fclose(env_file);
        printf("      Configuration file (.env) found.\n\n");
    }

    // 3. Install dependencies if node_modules is missing
    printf("[3/5] Checking dependencies...\n");
    GetFileAttributesA("node_modules");
    if (GetFileAttributesA("node_modules") == INVALID_FILE_ATTRIBUTES) {
        printf("      Dependencies not found. Installing packages (npm install)...\n");
        printf("      This may take 1-2 minutes on first run. Please wait...\n\n");
        int install_res = system("npm install");
        if (install_res != 0) {
            printf("\n[WARNING] 'npm install' returned code %d. Continuing...\n", install_res);
        }
    } else {
        printf("      node_modules already present.\n\n");
    }

    // 4. Build frontend if dist is missing
    printf("[4/5] Checking built assets...\n");
    if (GetFileAttributesA("dist") == INVALID_FILE_ATTRIBUTES) {
        printf("      Building application (npm run build)...\n");
        system("npm run build");
        printf("      Build finished.\n\n");
    } else {
        printf("      Assets are ready.\n\n");
    }

    // 5. Start Server and Launch Browser
    printf("[5/5] Starting Anisa AI Assistant server...\n");
    printf("===============================================================\n");
    printf("  Anisa AI will open in your browser at: http://localhost:3000\n");
    printf("  Press Ctrl+C in this window anytime to stop the server.\n");
    printf("===============================================================\n\n");

    open_browser_delayed();

    // Run npm start
    system("npm start");

    printf("\nServer stopped.\n");
    system("pause");
    return 0;
}
