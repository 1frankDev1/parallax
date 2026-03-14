import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Start a local server
        import subprocess
        server = subprocess.Popen(['python3', '-m', 'http.server', '8000', '--directory', 'docs'])
        await asyncio.sleep(2)

        await page.goto('http://localhost:8000/test2.html')

        print("Test 1: Reopen immediately")
        await page.click('[data-viewer-id="flyer-viewer"]')
        await asyncio.sleep(0.5)
        await page.click('#closePopup')
        await asyncio.sleep(0.1)
        await page.click('[data-viewer-id="flyer-viewer"]')
        await asyncio.sleep(0.5)
        src_after = await page.evaluate('document.getElementById("popupViewer").src')
        pointer_events = await page.evaluate('window.getComputedStyle(document.getElementById("modelPopup")).pointerEvents')
        if src_after and pointer_events != 'none':
            print("  - Success: Reopen works.")
        else:
            print(f"  - Failure: src={src_after}, pointer-events={pointer_events}")

        print("Test 2: Click background to close")
        # Ensure it's active
        if not await page.evaluate('document.getElementById("modelPopup").classList.contains("active")'):
            await page.click('[data-viewer-id="flyer-viewer"]')
            await asyncio.sleep(0.5)

        # Click on the popup background (far left)
        await page.mouse.click(10, 10)
        await asyncio.sleep(1)
        is_active = await page.evaluate('document.getElementById("modelPopup").classList.contains("active")')
        if not is_active:
            print("  - Success: Background click closes popup.")
        else:
            print("  - Failure: Background click did not close popup.")

        print("Test 3: Click model directly to open")
        # Click the model-viewer for poster
        await page.click('#poster-viewer')
        await asyncio.sleep(1)
        is_active = await page.evaluate('document.getElementById("modelPopup").classList.contains("active")')
        current_key = await page.evaluate('document.getElementById("popupViewer").dataset.currentKey')
        if is_active and current_key == 'poster':
            print("  - Success: Direct model click opens popup.")
        else:
            print(f"  - Failure: is_active={is_active}, current_key={current_key}")

        server.terminate()
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
