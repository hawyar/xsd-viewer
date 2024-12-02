class TreeViewer {
  constructor(container) {
    this.container = container;
  }

  async parseXSDFiles(files) {
    const parser = new DOMParser();
    const xsdDocs = [];

    for (const file of files) {
      const text = await file.text();
      const doc = parser.parseFromString(text, "text/xml");
      xsdDocs.push({ name: file.name, doc });
    }

    const processedData = this.processXSDDocs(xsdDocs);
    const stats = this.generateSchemaStats(processedData);

    this.renderStats(stats);
    this.renderTree(processedData);
  }

  processXSDDocs(docs) {
    const types = [];

    docs.forEach(({ doc, name }) => {
      const simpleTypes = doc.querySelectorAll("simpleType");
      simpleTypes.forEach((type) => {
        const typeData = this.processType(type, "simpleType", name);
        if (typeData) types.push(typeData);
      });

      const complexTypes = doc.querySelectorAll("complexType");
      complexTypes.forEach((type) => {
        const typeData = this.processType(type, "complexType", name);
        if (typeData) types.push(typeData);
      });
    });

    return types.sort((a, b) => a.name.localeCompare(b.name));
  }

  processType(typeElement, typeKind, fileName) {
    const name = typeElement.getAttribute("name");
    if (!name) return null;

    const children = [];
    const documentation = this.getDocumentation(typeElement);
    const restrictions = this.getRestrictions(typeElement);
    const attributes = this.getAttributes(typeElement);

    const enums = typeElement.querySelectorAll("enumeration");
    enums.forEach((enum_) => {
      const value = enum_.getAttribute("value");
      const enumDoc = this.getDocumentation(enum_);
      children.push({
        name: value,
        type: "enumeration",
        documentation: enumDoc,
      });
    });

    const elements = typeElement.querySelectorAll("element");
    elements.forEach((element) => {
      const elementName = element.getAttribute("name");
      const elementType = element.getAttribute("type");
      const elementDoc = this.getDocumentation(element);
      const minOccurs = element.getAttribute("minOccurs");
      const maxOccurs = element.getAttribute("maxOccurs");
      children.push({
        name: elementName,
        type: elementType,
        documentation: elementDoc,
        minOccurs,
        maxOccurs,
      });
    });

    return {
      name,
      type: typeKind,
      documentation,
      restrictions,
      attributes,
      children,
      fileName,
    };
  }

  getDocumentation(element) {
    const docElement = element.querySelector("annotation > documentation");
    return docElement ? docElement.textContent.trim() : "";
  }

  getRestrictions(element) {
    const restrictions = {};
    const restriction = element.querySelector("restriction");
    if (restriction) {
      restrictions.base = restriction.getAttribute("base");
      [
        "minLength",
        "maxLength",
        "pattern",
        "minInclusive",
        "maxInclusive",
      ].forEach((attr) => {
        const el = restriction.querySelector(attr);
        if (el) {
          restrictions[attr] = el.getAttribute("value");
        }
      });
    }
    return Object.keys(restrictions).length ? restrictions : null;
  }

  getAttributes(element) {
    const attributes = [];
    element.querySelectorAll("attribute").forEach((attr) => {
      attributes.push({
        name: attr.getAttribute("name"),
        type: attr.getAttribute("type"),
        use: attr.getAttribute("use"),
        documentation: this.getDocumentation(attr),
      });
    });
    return attributes.length ? attributes : null;
  }

  createNodeElement(node) {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "tree-node";

    const contentDiv = document.createElement("div");
    contentDiv.className = "node-content";

    const childrenDiv = document.createElement("div");
    childrenDiv.className = "children hidden";

    if (node.children && node.children.length > 0) {
      const toggleBtn = document.createElement("button");
      toggleBtn.className = "toggle-btn";
      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        toggleBtn.classList.toggle("open");
        childrenDiv.classList.toggle("hidden");
      };
      contentDiv.appendChild(toggleBtn);
    }

    const nodeInfo = document.createElement("div");
    nodeInfo.className = "node-info";

    const nameTypeDiv = document.createElement("div");
    const nameSpan = document.createElement("span");
    nameSpan.className = "node-name";
    nameSpan.textContent = node.name;
    nameTypeDiv.appendChild(nameSpan);

    if (node.type) {
      const typeSpan = document.createElement("span");
      typeSpan.className = "node-type";
      typeSpan.textContent = `${node.type}`;
      nameTypeDiv.appendChild(typeSpan);
    }

    nodeInfo.appendChild(nameTypeDiv);

    if (node.fileName || node.minOccurs || node.maxOccurs) {
      const metadataDiv = document.createElement("div");
      metadataDiv.className = "metadata";
      const metadata = [];
      if (node.fileName) metadata.push(`File: ${node.fileName}`);
      if (node.minOccurs) metadata.push(`Min: ${node.minOccurs}`);
      if (node.maxOccurs) metadata.push(`Max: ${node.maxOccurs}`);
      metadataDiv.textContent = metadata.join(" | ");
      nodeInfo.appendChild(metadataDiv);
    }

    contentDiv.appendChild(nodeInfo);
    nodeDiv.appendChild(contentDiv);

    if (node.documentation) {
      const docDiv = document.createElement("div");
      docDiv.className = "documentation";
      docDiv.textContent = node.documentation;
      nodeDiv.appendChild(docDiv);
    }

    if (node.restrictions) {
      const restrictionsDiv = document.createElement("div");
      restrictionsDiv.className = "restrictions";
      const restrictions = [];
      for (const [key, value] of Object.entries(node.restrictions)) {
        restrictions.push(`${key}: ${value}`);
      }
      restrictionsDiv.textContent = restrictions.join(" | ");
      nodeDiv.appendChild(restrictionsDiv);
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        childrenDiv.appendChild(this.createNodeElement(child));
      });
      nodeDiv.appendChild(childrenDiv);
    }

    return nodeDiv;
  }

  generateSchemaStats(types) {
    const stats = {
      totalTypes: types.length,
      simpleTypes: 0,
      complexTypes: 0,
      elements: 0,
      enumerations: 0,
      totalAttributes: 0,
      files: new Set(),
    };

    const processNode = (node) => {
      if (node.fileName) stats.files.add(node.fileName);

      const nodeType = (node.type || "").toLowerCase();

      switch (nodeType) {
        case "simpletype":
          stats.simpleTypes++;
          break;
        case "complextype":
          stats.complexTypes++;
          break;
        case "element":
          stats.elements++;
          break;
        case "enumeration":
          stats.enumerations++;
          break;
      }

      if (node.attributes) {
        stats.totalAttributes += node.attributes.length;
      }

      if (node.children) {
        node.children.forEach(processNode);
      }
    };

    types.forEach(processNode);

    return stats;
  }

  renderStats(stats) {
    const statsPanel = document.createElement("div");
    statsPanel.className = "stats-panel";

    statsPanel.innerHTML = `
  <div class="stats-grid">
      <div class="stat-item">
          <div class="stat-value">${stats.totalTypes}</div>
          <div class="stat-label">Total Types</div>
      </div>
      <div class="stat-item">
          <div class="stat-value">${stats.simpleTypes}</div>
          <div class="stat-label">Simple Types</div>
      </div>
      <div class="stat-item">
          <div class="stat-value">${stats.complexTypes}</div>
          <div class="stat-label">Complex Types</div>
      </div>
      <div class="stat-item">
          <div class="stat-value">${stats.elements}</div>
          <div class="stat-label">Elements</div>
      </div>
      <div class="stat-item">
          <div class="stat-value">${stats.enumerations}</div>
          <div class="stat-label">Enumerations</div>
      </div>
      <div class="stat-item">
          <div class="stat-value">${stats.totalAttributes}</div>
          <div class="stat-label">Total Attributes</div>
      </div>
      <div class="stat-item">
          <div class="stat-value">${stats.files.size}</div>
          <div class="stat-label">Files Loaded</div>
      </div>
  </div>
`;

    const header = document.querySelector("header");
    header.parentNode.insertBefore(statsPanel, header.nextSibling);
  }

  renderTree(types) {
    this.container.innerHTML = "";
    types.forEach((type) => {
      this.container.appendChild(this.createNodeElement(type));
    });
  }
}

const viewer = new TreeViewer(document.getElementById("treeViewer"));

document.getElementById("xsdFile").addEventListener("change", (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    viewer.parseXSDFiles(files);
  }
});
