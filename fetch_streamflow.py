import requests
import json
import datetime
import os

# Config
GAGE_ID = "04234000"
OUTPUT_FILE = "streamflow.json"

def get_usgs_data(parameter_code):
    """
    Fetches 7 days of IV data for a specific parameter.
    00060 = Discharge (cfs)
    00065 = Gage Height (ft)
    """
    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=7)
    
    url = "https://waterservices.usgs.gov/nwis/iv/"
    params = {
        "format": "json",
        "sites": GAGE_ID,
        "startDT": start_date.isoformat(),
        "endDT": today.isoformat(),
        "parameterCd": parameter_code,
        "siteStatus": "all"
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Check if timeSeries exists
        if "value" not in data or "timeSeries" not in data["value"] or not data["value"]["timeSeries"]:
            return None
            
        # Inspect values for validity (USGS error codes are usually negative large numbers)
        values = data["value"]["timeSeries"][0]["values"][0]["value"]
        
        if not values:
            return None
            
        # Check the last value. If it's -999999 (Ice), treat as invalid.
        last_val = float(values[-1]["value"])
        if last_val < -900000:
            return None
            
        return data

    except Exception as e:
        print(f"Error fetching param {parameter_code}: {e}")
        return None

def main():
    print(f"Checking Discharge (00060) for site {GAGE_ID}...")
    final_data = get_usgs_data("00060")
    data_type = "Discharge"
    unit = "cfs"

    if final_data is None:
        print("Discharge data is missing or ice-affected (frozen).")
        print(f"Falling back to Gage Height (00065)...")
        final_data = get_usgs_data("00065")
        data_type = "Gage Height"
        unit = "ft"

    if final_data:
        # We inject a small metadata field so the JS knows what to display
        final_data["_meta"] = {
            "type": data_type,
            "unit": unit
        }
        
        with open(OUTPUT_FILE, "w") as f:
            json.dump(final_data, f)
        print(f"Success! Saved {data_type} data to {OUTPUT_FILE}")
    else:
        print("Error: Both Discharge and Gage Height are unavailable.")
        # Optional: Write a specific error JSON so the site shows "Ice" instead of broken
        with open(OUTPUT_FILE, "w") as f:
            json.dump({"error": "Ice/Unavailable"}, f)

if __name__ == "__main__":
    main()