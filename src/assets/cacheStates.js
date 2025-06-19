export const states = ["I", "MP", "V", "M"];

export const cacheMaps = {
  "INVALID": "I",
  "MISS_PENDING": "MP",
  "VALID": "V",
  "MODIFIED": "M"
}

export const inputLabels = ["Invalidate", "CPUWr", "CPURd", "MemResp & wasRd", "MemResp & wasWr"];

export const transitions = [
  { from: "I", to: "I", label: "Invalidate / -", input: inputLabels[0] },
  { from: "I", to: "MP", label: "CPUWr / MemRd", input: inputLabels[1] },
  { from: "I", to: "MP", label: "CPURd / MemRd", input: inputLabels[2] },
  { from: "MP", to: "MP", label: "CPUWr / Wait", input: inputLabels[1] },
  { from: "MP", to: "MP", label: "CPURd / Wait", input: inputLabels[2] },
  { from: "MP", to: "V", label: "MemResp & wasRd / CPUResp", input: inputLabels[3] },
  { from: "MP", to: "M", label: "MemResp & wasWr / -", input: inputLabels[4] },
  { from: "V", to: "V", label: "CPURd / CPUResp", input: inputLabels[2] },
  { from: "V", to: "I", label: "Invalidate / -", input: inputLabels[0] },
  { from: "V", to: "M", label: "CPUWr / -", input: inputLabels[1] },
  { from: "M", to: "M", label: "CPUWr / -", input: inputLabels[1] },
  { from: "M", to: "M", label: "CPURd / CPUResp", input: inputLabels[2] },
  { from: "M", to: "I", label: "Invalidate / Write-back", input: inputLabels[0] },
];