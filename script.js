//Checkbox
const defaultCheckbox = document.getElementById("defaultCheckbox");
const defaultCheckboxTxt = document.getElementById("defaultCheckboxTxt");
const defaultCheckboxPrompts = ["OFF", "ON"];

const websiteCheckbox = document.getElementById("websiteCheckbox");
const websiteCheckboxTxt = document.getElementById("websiteCheckboxTxt");
const websiteCheckboxPrompts = ["Custom Setting", "Default Setting"];

//Sliding Bar
const defaultSlider = document.getElementById("defaultSlider");
const defaultSliderValue = document.getElementById("defaultSliderValue");
const resetDefaultButton = document.getElementById("resetDefaultSlider");

const websiteSlider = document.getElementById("websiteSlider");
const websiteSliderValue = document.getElementById("websiteSliderValue");
const resetWebsiteButton = document.getElementById("resetWebsiteSlider");

//URL Identifier
async function getCurrentDomain() {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    const url = new URL(tab.url);
    const domain = url.hostname.replace(/^www\./, "");

    return domain;
}

// Data Management

function getData(domain) {
    return chrome.storage.local.get(["data"]).then((result) => {
        const data = result.data || {};

        return {
            default: data.default || {},
            domain: data[domain] || {}
        };
    });
}

function writeData(newData, domain, domainData) {
    return chrome.storage.local.get(["data"]).then((result) => {
        const data = result.data || {};

        data.default = newData;
        data[domain] = domainData;

        return chrome.storage.local.set({
            data: data
        });
    });
}

//Update Saturation
async function updateSaturation() {
    try {
        const defaultSaturation = Number(defaultSlider.value) + 1;
        const websiteSaturation = Number(websiteSlider.value) + 1;

        getCurrentDomain().then(domain => {
            writeData(
                {
                    saturation: defaultSlider.value,
                    enabled: defaultCheckbox.checked
                },
                domain,
                {
                    saturation: websiteSlider.value,
                    enabled: websiteCheckbox.checked
                }
            );
        });

        if (defaultCheckbox.checked == false && websiteCheckbox.checked == false) {//dont follow def, follow first
            saturation = websiteSaturation
        } else if (defaultCheckbox.checked == false && websiteCheckbox.checked == true) {//dont follow def, follow ME
            saturation = 1
        } else if (defaultCheckbox.checked == true && websiteCheckbox.checked == false) {//follow me, follow first
            saturation = websiteSaturation
        } else if (defaultCheckbox.checked == true && websiteCheckbox.checked == true) {//follow me, follow ME
            saturation = defaultSaturation
        } else {
            saturation = 1
        }

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (!tab?.id) return;

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (saturation) => {
                document.documentElement.style.filter =
                    `saturate(${saturation})`;
            },
            args: [saturation]
        });

    } catch (error) {
        console.warn("Could not change page saturation:", error);
    }
}

// Checkbox Code
defaultCheckbox.addEventListener("change", () => {
    defaultCheckboxTxt.textContent = defaultCheckbox.checked
        ? defaultCheckboxPrompts[1]
        : defaultCheckboxPrompts[0];
    updateSaturation()
});

websiteCheckbox.addEventListener("change", () => {
    websiteCheckboxTxt.textContent = websiteCheckbox.checked
        ? websiteCheckboxPrompts[1]
        : websiteCheckboxPrompts[0];
    updateSaturation()
});

//Sliding Bar Code
function updateDefaultSlider() {
    defaultSliderValue.textContent = Number(defaultSlider.value).toFixed(2);
    updateSaturation()
}

function updateWebsiteSlider() {
    websiteSliderValue.textContent = Number(websiteSlider.value).toFixed(2);
    updateSaturation()
}

defaultSlider.addEventListener("input", updateDefaultSlider);
websiteSlider.addEventListener("input", updateWebsiteSlider);

resetDefaultButton.addEventListener("click", () => {
    defaultSlider.value = 0;
    updateDefaultSlider();
});
resetWebsiteButton.addEventListener("click", () => {
    websiteSlider.value = 0;
    updateWebsiteSlider();
});

getCurrentDomain().then(domain => {
    getData(domain).then((result) => {
        const defaultCheckboxValCheck = result.default.enabled ?? true;
        defaultCheckbox.checked = defaultCheckboxValCheck;
        defaultCheckboxTxt.textContent = defaultCheckboxPrompts[Number(defaultCheckboxValCheck)]
        
        const websiteCheckboxValCheck = result.domain.enabled ?? true;
        websiteCheckbox.checked = websiteCheckboxValCheck;
        websiteCheckboxTxt.textContent = websiteCheckboxPrompts[Number(websiteCheckboxValCheck)]

        const defaultSliderValCheck = result.default.saturation ?? 0;
        defaultSlider.value = defaultSliderValCheck;
        defaultSliderValue.textContent = Number(defaultSliderValCheck).toFixed(2);

        const websiteSliderValCheck = result.domain.saturation ?? 0;
        websiteSlider.value = websiteSliderValCheck;
        websiteSliderValue.textContent = Number(websiteSliderValCheck).toFixed(2);
    });
});