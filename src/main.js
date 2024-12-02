const sampleXSDData = `<?xml version="1.0" encoding="UTF-8"?>
<!-- 
 * #%L
 * org.hl7.fhir.r5
 * %%
 * Copyright (C) 2014 - 2019 Health Level 7
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */

/*
  Copyright (c) 2011+, HL7, Inc.
  All rights reserved.
  
  Redistribution and use in source and binary forms, with or without modification, 
  are permitted provided that the following conditions are met:
  
   * Redistributions of source code must retain the above copyright notice, this 
     list of conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above copyright notice, 
     this list of conditions and the following disclaimer in the documentation 
     and/or other materials provided with the distribution.
   * Neither the name of HL7 nor the names of its contributors may be used to 
     endorse or promote products derived from this software without specific 
     prior written permission.
  
  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT 
  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR 
  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, 
  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
  POSSIBILITY OF SUCH DAMAGE.
  

  Generated on Wed, Nov 27, 2024 19:21+0000 for FHIR v6.0.0-ballot2 

  Note: the schemas &amp; schematrons do not contain all of the rules about what makes resources
  valid. Implementers will still need to be familiar with the content of the specification and with
  any profiles that apply to the resources in order to make a conformant implementation.

-->
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns="http://hl7.org/fhir" xmlns:xhtml="http://www.w3.org/1999/xhtml" targetNamespace="http://hl7.org/fhir" elementFormDefault="qualified" version="1.0">
  <xs:include schemaLocation="fhir-base.xsd"/>
  <xs:element name="Basic" type="Basic">
    <xs:annotation>
      <xs:documentation xml:lang="en">Basic is used for handling concepts not yet defined in FHIR, narrative-only resources that don't map to an existing resource, and custom resources not appropriate for inclusion in the FHIR specification.</xs:documentation>
    </xs:annotation>
  </xs:element>
  <xs:complexType name="Basic">
    <xs:annotation>
      <xs:documentation xml:lang="en">Basic is used for handling concepts not yet defined in FHIR, narrative-only resources that don't map to an existing resource, and custom resources not appropriate for inclusion in the FHIR specification.</xs:documentation>
      <xs:documentation xml:lang="en">If the element is present, it must have either a @value, an @id, or extensions</xs:documentation>
    </xs:annotation>
    <xs:complexContent>
      <xs:extension base="DomainResource">
        <xs:sequence>
          <xs:element name="identifier" minOccurs="0" maxOccurs="unbounded" type="Identifier">
            <xs:annotation>
              <xs:documentation xml:lang="en">Identifier assigned to the resource for business purposes, outside the context of FHIR.</xs:documentation>
           </xs:annotation>
          </xs:element>
          <xs:element name="code" minOccurs="1" maxOccurs="1" type="CodeableConcept">
            <xs:annotation>
              <xs:documentation xml:lang="en">Identifies the 'type' of resource - equivalent to the resource name for other resources.</xs:documentation>
           </xs:annotation>
          </xs:element>
          <xs:element name="subject" minOccurs="0" maxOccurs="1" type="Reference">
            <xs:annotation>
              <xs:documentation xml:lang="en">Identifies the patient, practitioner, device or any other resource that is the &quot;focus&quot; of this resource.</xs:documentation>
           </xs:annotation>
          </xs:element>
          <xs:element name="created" minOccurs="0" maxOccurs="1" type="dateTime">
            <xs:annotation>
              <xs:documentation xml:lang="en">Identifies when the resource was first created.</xs:documentation>
           </xs:annotation>
          </xs:element>
          <xs:element name="author" minOccurs="0" maxOccurs="1" type="Reference">
            <xs:annotation>
              <xs:documentation xml:lang="en">Indicates who was responsible for creating the resource instance.</xs:documentation>
           </xs:annotation>
          </xs:element>
        </xs:sequence>
      </xs:extension>
    </xs:complexContent>
  </xs:complexType>
</xs:schema>
`;

class TreeViewer {
  constructor(container) {
    this.container = container;
    this.addSearchBar();
    this.addControlButtons();
  }

  async parseXSDFiles(files) {
    try {
      this.showLoading();
      const parser = new DOMParser();
      const xsdDocs = [];

      for (const file of files) {
        try {
          const text = await file.text();
          const doc = parser.parseFromString(text, "text/xml");

          if (doc.querySelector("parsererror")) {
            throw new Error(`Invalid XML in file: ${file.name}`);
          }

          xsdDocs.push({ name: file.name, doc });
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
        }
      }

      if (xsdDocs.length === 0) {
        throw new Error("No valid XSD files were loaded");
      }

      console.log("XSD Docs:", xsdDocs); // Debug log
      const processedData = this.processXSDDocs(xsdDocs);
      console.log("Processed Data:", processedData); // Debug log

      const stats = this.generateSchemaStats(processedData);
      console.log("Generated Stats:", stats); // Debug log

      this.generateSchemaStats(stats);
      this.renderTree(processedData);
    } catch (error) {
      console.error("Error parsing files:", error);
    } finally {
      this.hideLoading();
    }
  }

  renderFileList(fileNames) {
    const existingList = document.querySelector(".file-list");
    if (existingList) {
      existingList.remove();
    }

    const fileList = document.createElement("div");
    fileList.className = "file-list";

    fileList.innerHTML = `
        <div class="file-list-header">Loaded Files:</div>
        <div class="file-list-content">
            ${fileNames
              .map(
                (name) => `
                <div class="file-item">
                    <span class="file-name">${name}</span>
                </div>
            `
              )
              .join("")}
        </div>
    `;

    const header = document.querySelector("header");
    header.querySelector(".header-content").appendChild(fileList);
  }

  showLoading() {
    const loader = document.createElement("div");
    loader.className = "loader";
    loader.innerHTML = `
        <div class="loader-content">
            <div class="spinner"></div>
            <div>Processing files...</div>
        </div>
    `;
    document.body.appendChild(loader);
  }

  hideLoading() {
    const loader = document.querySelector(".loader");
    if (loader) loader.remove();
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    this.container.prepend(errorDiv);

    setTimeout(() => errorDiv.remove(), 5000);
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    this.container.prepend(errorDiv);

    setTimeout(() => errorDiv.remove(), 5000);
  }

  processXSDDocs(docs) {
    if (!Array.isArray(docs)) {
      console.error("Expected array of docs, got:", docs);
      return [];
    }

    const types = [];

    for (const { doc, name } of docs) {
      if (!doc || !name) {
        console.error("Invalid doc object:", { doc, name });
        continue;
      }

      types.push(...this.processSimpleTypes(doc, name));
      types.push(...this.processComplexTypes(doc, name));
      types.push(...this.processElements(doc, name));
      types.push(...this.processComplexContent(doc, name));
    }

    return types;
  }

  processSimpleTypes(doc, fileName) {
    const simpleTypes = [];
    const simpleTypeElements = doc.querySelectorAll("simpleType");

    for (const typeElement of simpleTypeElements) {
      const typeData = this.processType(typeElement, "simpleType", fileName);
      if (typeData) {
        simpleTypes.push(typeData);
      }
    }

    return simpleTypes;
  }

  processComplexTypes(doc, fileName) {
    const complexTypes = [];
    const complexTypeElements = doc.querySelectorAll("complexType");

    for (const typeElement of complexTypeElements) {
      const typeData = this.processType(typeElement, "complexType", fileName);
      if (typeData) {
        complexTypes.push(typeData);
      }
    }

    return complexTypes;
  }

  processElements(doc, fileName) {
    const elements = [];
    const elementElements = doc.querySelectorAll("schema > element");

    for (const elementElement of elementElements) {
      const elementData = this.processType(elementElement, "element", fileName);
      if (elementData) {
        elements.push(elementData);
      }
    }

    return elements;
  }

  processType(typeElement, typeKind, fileName) {
    const name = typeElement.getAttribute("name");
    if (!name) {
      return null;
    }

    const children = [];
    const documentation = this.getDocumentation(typeElement);
    const restrictions = this.getRestrictions(typeElement);
    const attributes = this.getAttributes(typeElement);

    // Process enumerations
    const enums = typeElement.querySelectorAll("enumeration");
    for (const enum_ of enums) {
      const value = enum_.getAttribute("value");
      const enumDoc = this.getDocumentation(enum_);
      children.push({
        name: value,
        type: "enumeration",
        documentation: enumDoc,
      });
    }

    // Process child elements
    const elements = typeElement.querySelectorAll("element");
    for (const element of elements) {
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
    }

    // Process complexContent
    const complexContent = typeElement.querySelector("complexContent");
    if (complexContent) {
      const baseType = complexContent.getAttribute("base");
      const extension = complexContent.querySelector("extension");
      if (extension) {
        const complexContentData = this.processComplexContentExtension(
          extension,
          baseType,
          fileName
        );
        if (complexContentData) {
          children.push(complexContentData);
        }
      }
    }

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

  processComplexContent(doc, fileName) {
    const complexContentTypes = [];
    const complexContentElements = doc.querySelectorAll(
      "complexType > complexContent"
    );

    for (const contentElement of complexContentElements) {
      const baseType = contentElement.getAttribute("base");
      const extension = contentElement.querySelector("extension");

      if (extension) {
        const typeData = this.processComplexContentExtension(
          extension,
          baseType,
          fileName
        );
        if (typeData) {
          complexContentTypes.push(typeData);
        }
      }
    }

    return complexContentTypes;
  }

  processComplexContentExtension(extensionElement, baseType, fileName) {
    const name = extensionElement.getAttribute("base");
    const sequenceElement = extensionElement.querySelector("sequence");
    const children = this.processSequenceGroup(sequenceElement);

    return {
      name,
      type: "complexContent",
      baseType,
      children,
      fileName,
    };
  }

  processSequenceGroup(sequenceElement) {
    if (!sequenceElement) {
      return [];
    }

    const children = [];
    const elements = sequenceElement.querySelectorAll("element");

    for (const element of elements) {
      const elementData = this.processType(element, "element", null);
      if (elementData) {
        children.push(elementData);
      }
    }

    return children;
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
    if (!Array.isArray(types)) {
      console.error("Types is not an array:", types);
      return [];
    }

    const typesByFile = types.reduce((acc, type) => {
      const fileName = type.fileName || "Unknown File";
      if (!acc[fileName]) {
        acc[fileName] = [];
      }
      acc[fileName].push(type);
      return acc;
    }, {});

    return Object.entries(typesByFile).map(([fileName, fileTypes]) => {
      const stats = {
        totalTypes: fileTypes.length,
        simpleTypes: 0,
        complexTypes: 0,
        elements: 0,
        enumerations: 0,
        totalAttributes: 0,
        fileName,
      };

      fileTypes.forEach((type) => {
        const nodeType = (type.type || "").toLowerCase();
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

        if (type.attributes) {
          stats.totalAttributes += type.attributes.length;
        }
      });

      return stats;
    });
  }

  renderTree(stats) {
    if (!Array.isArray(stats)) {
      console.error("Expected array of stats, got:", stats);
      return;
    }

    this.container.innerHTML = "";

    stats.forEach((fileStats) => {
      const fileSection = document.createElement("div");
      fileSection.className = "file-section";

      const fileHeader = document.createElement("div");
      fileHeader.className = "file-header";
      fileHeader.textContent = `File: ${fileStats.fileName} (${fileStats.totalTypes} types)`;
      fileSection.appendChild(fileHeader);

      fileStats.types.forEach((type) => {
        fileSection.appendChild(this.createNodeElement(type));
      });

      this.container.appendChild(fileSection);
    });
  }

  addSearchBar() {
    const searchDiv = document.createElement("div");
    searchDiv.className = "search-container";
    searchDiv.innerHTML = `
        <input type="text" 
               id="schemaSearch" 
               placeholder="Search schema..." 
               class="search-input">
    `;

    const header = document.querySelector("header");
    header.querySelector(".header-content").appendChild(searchDiv);

    document.getElementById("schemaSearch").addEventListener("input", (e) => {
      this.filterNodes(e.target.value.toLowerCase());
    });
  }

  filterNodes(searchTerm) {
    const allNodes = document.querySelectorAll(".tree-node");
    allNodes.forEach((node) => {
      const nodeName = node
        .querySelector(".node-name")
        .textContent.toLowerCase();
      const nodeType =
        node.querySelector(".node-type")?.textContent.toLowerCase() || "";
      const documentation =
        node.querySelector(".documentation")?.textContent.toLowerCase() || "";

      const matches =
        nodeName.includes(searchTerm) ||
        nodeType.includes(searchTerm) ||
        documentation.includes(searchTerm);

      node.style.display = matches ? "" : "none";
    });
  }

  addControlButtons() {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "control-buttons";
    buttonContainer.innerHTML = `
        <button class="control-btn" id="expandAll">Expand All</button>
        <button class="control-btn" id="collapseAll">Collapse All</button>
    `;

    const searchContainer = document.querySelector(".search-container");
    searchContainer.appendChild(buttonContainer);

    document.getElementById("expandAll").onclick = () => this.toggleAll(true);
    document.getElementById("collapseAll").onclick = () =>
      this.toggleAll(false);
  }

  toggleAll(expand) {
    const toggleButtons = document.querySelectorAll(".toggle-btn");
    const childrenDivs = document.querySelectorAll(".children");

    toggleButtons.forEach((btn) => {
      if (expand) btn.classList.add("open");
      else btn.classList.remove("open");
    });

    childrenDivs.forEach((div) => {
      if (expand) div.classList.remove("hidden");
      else div.classList.add("hidden");
    });
  }

  renderTree(types) {
    if (!Array.isArray(types)) {
      console.error("Expected array of types, got:", types);
      return;
    }

    this.container.innerHTML = "";

    types.forEach((type) => {
      this.container.appendChild(this.createNodeElement(type));
    });
  }
}

const viewer = new TreeViewer(document.getElementById("treeViewer"));

const sampleXSDFile = new File([sampleXSDData], "sample.xsd", {
  type: "application/xml",
});

document.getElementById("loadSampleData").addEventListener("click", () => {
  viewer.parseXSDFiles([sampleXSDFile]);
});

document.getElementById("xsdFile").addEventListener("change", (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    viewer.parseXSDFiles(files);
  }
});
