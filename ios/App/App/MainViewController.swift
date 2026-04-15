import Foundation
import Capacitor
import WebKit

class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        // Inject native flag before any page JavaScript runs
        let script = WKUserScript(
            source: """
                window.__IS_NATIVE_APP__ = true;
                try { localStorage.setItem('hockeyrefresh-native', '1'); } catch(e) {}
            """,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )
        webView?.configuration.userContentController.addUserScript(script)
    }
}
