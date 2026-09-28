export async function loadCircuitLibrary(baseUrl="/circuit-library-v3-full"){
  const categories = await fetch(`${baseUrl}/catalog/categories.json`).then(r=>r.json());
  const loadJson = (rel) => fetch(`${baseUrl}/${rel}`).then(r=>r.json());
  const loadMenu = (source) => loadJson(source);
  const loadRecord = (item) => loadJson(item.record_json || item.component_json);
  return {categories, loadJson, loadMenu, loadRecord};
}