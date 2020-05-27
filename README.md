Setting up the plugin

In your gatsby project directory:

`npm install --save gatsby-source-portway`

Then in your project’s gatsby-config.js file add the plugin to the registry, we recommend passing in the necessary Portway token and project id as environment variables, you’ll never want to check your tokens into source control.

```js
plugins: [
	{
    resolve: 'gatsby-source-portway',
    options: {
      token: process.env.PORTWAY_TOKEN,
      projectId: process.env.PORTWAY_PROJECT_ID
    }
	}
]
```

Here are some Gatsby tips on using environment variables https://www.gatsbyjs.org/docs/environment-variables/https://www.gatsbyjs.org/docs/environment-variables/

Example query for fetching project data:

```graphql
export const query = graphql`
  query portwayQuery {
    allPortwayDocument {
      nodes {
        children {
          id
          ... on PortwayField {
            id
            name
            order
            structuredValue {
              type
              tag
            }
            type
            uid
            updatedAt
            value
            versionId
            createdAt
            documentId
          }
        }
        lastPublishedAt
        projectId
        publishedVersionId
        uid
        updatedAt
        name
        id
        createdAt
      }
    }
    allPortwayProject {
      nodes {
        createdAt
        createdBy
        id
        description
        name
        uid
        updatedAt
      }
    }
  }
`
```
