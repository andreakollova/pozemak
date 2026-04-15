import Foundation
import Capacitor
import WebKit

class MainViewController: CAPBridgeViewController {
    override func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let config = super.webViewConfiguration(for: instanceConfiguration)
        let source = """
            window.__IS_NATIVE_APP__ = true;
            try { localStorage.setItem('hockeyrefresh-native', '1'); } catch(e) {}
        """
        let script = WKUserScript(
            source: source,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )
        config.userContentController.addUserScript(script)
        return config
    }
}
