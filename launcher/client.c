#define COBJMACROS
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <winhttp.h>
#include <shellapi.h>
#include <objidl.h>
#include <gdiplus.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "boot_jpg.h"

static const wchar_t *LOCAL_VERSION = L"1.0.0";
static const wchar_t *HOST = L"abis-sonsuz-gece.grok.me";
static const wchar_t *FALLBACK_GAME = L"https://abis-sonsuz-gece.grok.me";

static HWND g_wnd, g_start;
static int g_pct = 4;
static int g_ready = 0;
static wchar_t g_game[512];
static wchar_t g_note[256];
static wchar_t g_line[320];
static GpImage *g_art = NULL;
static ULONG_PTR g_gdip = 0;

static void set_status(const wchar_t *text) {
    lstrcpynW(g_line, text, 320);
    if (g_wnd) InvalidateRect(g_wnd, NULL, FALSE);
}

static int cmp_ver(const wchar_t *a, const wchar_t *b) {
    return wcscmp(a, b);
}

static void pick_json_str(const char *body, const char *key, wchar_t *out, int out_len) {
    char pat[64];
    const char *p;
    int n = 0;
    snprintf(pat, sizeof(pat), "\"%s\"", key);
    p = strstr(body, pat);
    if (!p) return;
    p = strchr(p + strlen(pat), '"');
    if (!p) return;
    p++;
    while (*p && *p != '"' && n < out_len - 1) {
        out[n++] = (wchar_t)(unsigned char)*p++;
    }
    out[n] = 0;
}

static DWORD WINAPI check_updates(LPVOID unused) {
    HINTERNET ses = NULL, con = NULL, req = NULL;
    DWORD read = 0, total = 0;
    char buf[4096];
    char body[8192];
    BOOL ok;
    wchar_t remote[64];
    (void)unused;
    body[0] = 0;
    remote[0] = 0;
    g_pct = 18;
    InvalidateRect(g_wnd, NULL, FALSE);
    ses = WinHttpOpen(L"AbisClient/1.0", WINHTTP_ACCESS_TYPE_DEFAULT_PROXY, WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0);
    if (!ses) goto done;
    g_pct = 36;
    InvalidateRect(g_wnd, NULL, FALSE);
    con = WinHttpConnect(ses, HOST, INTERNET_DEFAULT_HTTPS_PORT, 0);
    if (!con) goto done;
    req = WinHttpOpenRequest(con, L"GET", L"/version.json", NULL, WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES, WINHTTP_FLAG_SECURE);
    if (!req) goto done;
    g_pct = 58;
    InvalidateRect(g_wnd, NULL, FALSE);
    ok = WinHttpSendRequest(req, WINHTTP_NO_ADDITIONAL_HEADERS, 0, WINHTTP_NO_REQUEST_DATA, 0, 0, 0);
    if (!ok || !WinHttpReceiveResponse(req, NULL)) goto done;
    while (WinHttpReadData(req, buf, sizeof(buf) - 1, &read) && read) {
        if (total + read >= sizeof(body) - 1) break;
        memcpy(body + total, buf, read);
        total += read;
    }
    body[total] = 0;
    pick_json_str(body, "version", remote, 64);
    pick_json_str(body, "game", g_game, 512);
    pick_json_str(body, "notes", g_note, 256);

done:
    g_pct = 100;
    g_ready = 1;
    if (!g_game[0]) lstrcpynW(g_game, FALLBACK_GAME, 512);
    if (remote[0] == 0) {
        set_status(L"Sunucuya ulasilamadi. Yerel surumle devam edilebilir.");
    } else if (cmp_ver(remote, LOCAL_VERSION) != 0) {
        wchar_t line[256];
        _snwprintf(line, 256, L"Guncelleme var: %s  (sende %s). Oyunu yine de baslatabilirsin.", remote, LOCAL_VERSION);
        set_status(line);
    } else {
        set_status(L"Guncel surum. Oyunu baslatabilirsin.");
    }
    EnableWindow(g_start, TRUE);
    InvalidateRect(g_wnd, NULL, FALSE);
    if (req) WinHttpCloseHandle(req);
    if (con) WinHttpCloseHandle(con);
    if (ses) WinHttpCloseHandle(ses);
    return 0;
}

static void paint(HWND hwnd) {
    PAINTSTRUCT ps;
    HDC dc = BeginPaint(hwnd, &ps);
    RECT rc;
    RECT bar, fill;
    HBRUSH bg, edge, ink;
    int w, h, bw, bh, bx, by;
    wchar_t pct[16];
    GetClientRect(hwnd, &rc);
    w = rc.right;
    h = rc.bottom;
    if (g_art) {
        GpGraphics *gfx = NULL;
        GdipCreateFromHDC(dc, &gfx);
        GdipDrawImageRectI(gfx, g_art, 0, 0, w, h);
        GdipDeleteGraphics(gfx);
    } else {
        bg = CreateSolidBrush(RGB(8, 8, 10));
        FillRect(dc, &rc, bg);
        DeleteObject(bg);
    }
    bw = w * 46 / 100;
    if (bw < 260) bw = 260;
    bh = 16;
    bx = (w - bw) / 2;
    by = h - 118;
    _snwprintf(pct, 16, L"%d%%", g_pct);
    SetBkMode(dc, TRANSPARENT);
    SetTextColor(dc, RGB(231, 253, 255));
    {
        RECT tr = {40, by - 48, w - 40, by - 24};
        DrawTextW(dc, g_line, -1, &tr, DT_CENTER | DT_SINGLELINE | DT_END_ELLIPSIS);
        tr.top = by - 22;
        tr.bottom = by;
        DrawTextW(dc, pct, -1, &tr, DT_CENTER | DT_SINGLELINE);
    }
    bar.left = bx;
    bar.top = by;
    bar.right = bx + bw;
    bar.bottom = by + bh;
    edge = CreateSolidBrush(RGB(58, 212, 228));
    FrameRect(dc, &bar, edge);
    DeleteObject(edge);
    fill = bar;
    InflateRect(&fill, -3, -3);
    fill.right = fill.left + (fill.right - fill.left) * g_pct / 100;
    if (fill.right < fill.left) fill.right = fill.left;
    ink = CreateSolidBrush(RGB(70, 230, 245));
    FillRect(dc, &fill, ink);
    DeleteObject(ink);
    EndPaint(hwnd, &ps);
}

static LRESULT CALLBACK wnd_proc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
    switch (msg) {
    case WM_CREATE:
        lstrcpynW(g_line, L"Guncellemeler kontrol ediliyor...", 320);
        g_start = CreateWindowExW(0, L"BUTTON", L"Oyunu Baslat", WS_CHILD | WS_VISIBLE | WS_DISABLED,
            430, 560, 180, 34, hwnd, (HMENU)1, NULL, NULL);
        CreateThread(NULL, 0, check_updates, NULL, 0, NULL);
        return 0;
    case WM_SIZE: {
        int w = LOWORD(lp);
        int h = HIWORD(lp);
        if (g_start) MoveWindow(g_start, (w - 180) / 2, h - 48, 180, 34, TRUE);
        return 0;
    }
    case WM_COMMAND:
        if (LOWORD(wp) == 1 && g_ready) {
            ShellExecuteW(hwnd, L"open", g_game, NULL, NULL, SW_SHOWNORMAL);
        }
        return 0;
    case WM_PAINT:
        paint(hwnd);
        return 0;
    case WM_DESTROY:
        PostQuitMessage(0);
        return 0;
    default:
        return DefWindowProcW(hwnd, msg, wp, lp);
    }
}

int WINAPI WinMain(HINSTANCE inst, HINSTANCE prev, LPSTR cmd, int show) {
    WNDCLASSW wc;
    MSG msg;
    GdiplusStartupInput input;
    IStream *stream = NULL;
    HGLOBAL mem;
    void *bytes;
    (void)prev;
    (void)cmd;
    input.GdiplusVersion = 1;
    input.DebugEventCallback = NULL;
    input.SuppressBackgroundThread = FALSE;
    input.SuppressExternalCodecs = FALSE;
    if (GdiplusStartup(&g_gdip, &input, NULL) != Ok) return 1;
    mem = GlobalAlloc(GMEM_MOVEABLE, boot_jpg_len);
    bytes = GlobalLock(mem);
    memcpy(bytes, boot_jpg, boot_jpg_len);
    GlobalUnlock(mem);
    if (CreateStreamOnHGlobal(mem, TRUE, &stream) == S_OK) {
        GdipCreateBitmapFromStream(stream, (GpBitmap **)&g_art);
        stream->lpVtbl->Release(stream);
    }
    ZeroMemory(&wc, sizeof(wc));
    wc.lpfnWndProc = wnd_proc;
    wc.hInstance = inst;
    wc.lpszClassName = L"AbisClient";
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    RegisterClassW(&wc);
    g_wnd = CreateWindowExW(0, L"AbisClient", L"Abis: Sonsuz Gece", WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX,
        CW_USEDEFAULT, CW_USEDEFAULT, 1100, 700, NULL, NULL, inst, NULL);
    ShowWindow(g_wnd, show);
    UpdateWindow(g_wnd);
    while (GetMessageW(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessageW(&msg);
    }
    if (g_art) GdipDisposeImage(g_art);
    GdiplusShutdown(g_gdip);
    return 0;
}
