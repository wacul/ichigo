function setText(dom: HTMLElement, text: string) {
  if ("innerText" in dom) {
    (dom as any)["innerText"] = text;
  } else if ("textContent" in dom) {
    (dom as any)["textContent"] = text;
  } else {
    console.error("failed to access dom inner text. textContent and innerText are not able to be accessed");
  }
}
