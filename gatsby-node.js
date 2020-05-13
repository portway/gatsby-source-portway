const fetch = require("node-fetch")

/**
 * You can uncomment the following line to verify that
 * your plugin is being loaded in your site.
 *
 * See: https://www.gatsbyjs.org/docs/creating-a-local-plugin/#developing-a-local-plugin-that-is-outside-your-project
 */

// constants for your GraphQL Project, Document, and Field types
const PROJECT_NODE_TYPE = `Project`
const DOCUMENT_NODE_TYPE = `Document`
const FIELD_NODE_TYPE = `Field`

const fetchFromPortway = async (url, token) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  
  if (response.ok) {
    // response.status >= 200 && response.status < 300
    return response.json()
  } else {
    throw new Error(response.statusText)
  }
}

const fetchProject = async (projectId, token) => {
  const { data } = await fetchFromPortway(
    `https://api.portway.app/api/v1/projects/${projectId}/documents`,
    token
  )
  return data
}

const fetchDocument = async (documentId, token) => {
  const { data } = await fetchFromPortway(
    `https://api.portway.app/api/v1/documents/${documentId}`,
    token
  );
  return data
}

exports.sourceNodes = async ({
  actions,
  createContentDigest,
  createNodeId,
  getNodesByType,
}, configOptions) => {
  const { createNode } = actions
  const { projectId, token } = configOptions

  const project = await fetchProject(projectId, token)
  // create project node
  console.log(project)
  
  // loop through documents and create Gatsby nodes
  await Promise.all(
    project.documents.map(async (document) => {
      const populatedDocument = await fetchDocument(document.id, token)
      const nodeId = createNodeId(`portway-document-${document.id}`);
      const nodeData = {
        uid: populatedDocument.id,
        name: populatedDocument.name,
        content: populatedDocument.fields,
        lastPublishedAt: populatedDocument.lastPublishedAt,
        updatedAt: populatedDocument.updatedAt,
        createdAt: populatedDocument.createdAt,

        // Required fields
        id: nodeId,
        parent: null,
        children: [],
        internal: {
          type: DOCUMENT_NODE_TYPE,
          mediaType: "application/json",
          contentDigest: createContentDigest(populatedDocument.fields),
        },
      };
      createNode(nodeData)
    })
  );

  return
}
exports.onPreInit = () => console.log("Loaded gatsby-portway-plugin")
