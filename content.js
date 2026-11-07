async function applySaturation() {
    try {
        const url = new URL(window.location.href);
        const domain = url.hostname.replace(/^www\./, "");

        function getData(domain) {
            return chrome.storage.local.get(["data"]).then((result) => {
                const data = result.data || {};

                return {
                    default: data.default || {},
                    domain: data[domain] || {}
                };
            });
        }

        function apply() {
            if (!document.documentElement) return false;

            getData(domain).then((result) => {
                const defaultCheckboxChecked = result.default.enabled ?? true;
                const websiteCheckboxChecked = result.domain.enabled ?? true;

                if (defaultCheckboxChecked == false && websiteCheckboxChecked == false) {
                    saturation = result.domain.saturation ?? 0;
                } else if (defaultCheckboxChecked == false && websiteCheckboxChecked == true) {
                    saturation = 1
                } else if (defaultCheckboxChecked == true && websiteCheckboxChecked == false) {
                    saturation = result.domain.saturation ?? 0;
                } else if (defaultCheckboxChecked == true && websiteCheckboxChecked == true) {
                    saturation = result.default.saturation ?? 0;
                } else {
                    saturation = 1
                }

                document.documentElement.style.setProperty(
                    "filter",
                    `saturate(${Number(saturation) + 1})`,
                    "important"
                );
            });

            return true;
        }

        if (!apply()) {
            const observer = new MutationObserver(() => {
                if (apply()) observer.disconnect();
            });

            observer.observe(document, {
                childList: true,
                subtree: true
            });
        }

    } catch (error) {
        console.error("Saturation error:", error);
    }
}

applySaturation();

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "refreshSettings") {
        applySaturation();
    }
});
