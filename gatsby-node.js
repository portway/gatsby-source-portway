const fetch = require('node-fetch')

/**
 * You can uncomment the following line to verify that
 * your plugin is being loaded in your site.
 *
 * See: https://www.gatsbyjs.org/docs/creating-a-local-plugin/#developing-a-local-plugin-that-is-outside-your-project
 */

// constants for your GraphQL Project, Document, and Field types
const PROJECT_NODE_TYPE = `PortwayProject`
const DOCUMENT_NODE_TYPE = `PortwayDocument`
const FIELD_NODE_TYPE = `PortwayField`

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
  let project

  try {
    const { data } = await fetchFromPortway(
      `https://api.portway.app/api/v1/projects/${projectId}`,
      token
    )
    project = data
  } catch(err) {
    throw new Error(`Unable to fetch project with id ${projectId}. 
    Make sure you have the correct project id and that you have access to this project with the token provided.
    Go here to see your Portway project: https://portway.app/d/project/${projectId}
    `)
  }

  return project
}

const fetchProjectDocuments = async (projectId, token) => {
  let documents

  try {
    const { data } = await fetchFromPortway(
      `https://api.portway.app/api/v1/projects/${projectId}/documents`,
      token
    )
    documents = data
  } catch (err) {
    throw new Error(`Unable to fetch documents for project with id ${projectId}`)
  }

  return documents
}

const fetchDocumentFields = async (documentId, token) => {
  let fields

  try {
    const { data } = await fetchFromPortway(
      `https://api.portway.app/api/v1/documents/${documentId}/fields`,
      token
    )
    fields = data
  } catch(err) {
    throw new Error(`Unable to fetch fields for document with id ${documentId}`)
  }

  return fields
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
  const nodeId = createNodeId(`portway-project-${project.id}`)

  const nodeData = {
    ...project,
    uid: project.id,
    // Required fields
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: PROJECT_NODE_TYPE,
      mediaType: 'application/json',
      contentDigest: createContentDigest(JSON.stringify(project))
    },
  }
  createNode(nodeData)


  const projectDocuments = await fetchProjectDocuments(projectId, token)
  // loop through documents and create Gatsby nodes
  await Promise.all(
    projectDocuments.map(async (document) => {
      const documentNodeId = createNodeId(`portway-document-${document.id}`)

      const documentFields = await fetchDocumentFields(document.id, token)

      // create field nodes
      const documentFieldNodeIds = documentFields.map((field) => {
        const fieldNodeId = createNodeId(`portway-field-${field.id}`)
        const fieldNodeData = {
          ...field,
          uid: field.id,
          // Required fields
          id: fieldNodeId,
          parent: documentNodeId,
          children: [],
          internal: {
            type: FIELD_NODE_TYPE,
            mediaType: 'application/json',
            contentDigest: createContentDigest(JSON.stringify(field))
          }
        }
        createNode(fieldNodeData)
        return fieldNodeId
      })

      // create parent document node with field references
      const documentNodeData = {
        ...document,
        uid: document.id,
        // Required fields
        id: documentNodeId,
        parent: null,
        children: documentFieldNodeIds,
        internal: {
          type: DOCUMENT_NODE_TYPE,
          mediaType: 'application/json',
          contentDigest: createContentDigest(JSON.stringify(document)),
        },
      }
      createNode(documentNodeData)
    })
  )

  return
}
exports.onPreInit = () => console.log('Loaded gatsby-source-portway')
