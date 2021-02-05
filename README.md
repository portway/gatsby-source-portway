# A GatsbyJS plugin to source content from Portway

Use [Portway](https://getportway.com) as a content source for your GatsbyJS site.

See the [Guide on building a website using Portway and GatsbyJS](https://docs.portway.app/guides/build-a-simple-website-with-gatsby)

### Setting up the plugin

In your gatsby project directory:

`npm install @portway/gatsby-source-portway`

Then in your project’s gatsby-config.js file add the plugin to the registry, we recommend passing in the necessary Portway token and project id as environment variables, you’ll never want to check your tokens into source control.

Include the gatsby-plugin-sharp and gatsby-transformer-sharp plugins to add options for portway image handling and caching

```js
plugins: [
  gatsby-plugin-sharp,
  gatsby-transformer-sharp,
  {
    resolve: '@portway/gatsby-source-portway',
    options: {
      token: process.env.PORTWAY_TOKEN,
      projectId: process.env.PORTWAY_PROJECT_ID
    }
  }
]
```

Here are some Gatsby tips on using environment variables https://www.gatsbyjs.org/docs/environment-variables/https://www.gatsbyjs.org/docs/environment-variables/

#### Example query for fetching project data:

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
