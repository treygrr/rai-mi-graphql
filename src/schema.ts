import { randomUUID } from 'crypto'
import { createSchema } from 'graphql-yoga'

type Product = {
  id: string,
  title: string,
  stock: number,
  qty: number,
}

type UpdateProductInput = Product

const products: Product[] = [
  {
    id: randomUUID(),
    title: 'BR120',
    stock: 48923,
    qty: 0
  },
  {
    id: randomUUID(),
    title: 'Battery',
    stock: 4100,
    qty: 0
  },
  {
    id: randomUUID(),
    title: 'Oil Funnel',
    stock: 1410,
    qty: 0
  },
  {
    id: randomUUID(),
    title: 'Wrench',
    stock: 2001,
    qty: 0
  }
]

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Product {
      id: ID!,
      title: String!,
      stock: Int!,
      qty: Int!
    }
    input UpdateProductInput {
      id: ID!,
      title: String!,
      stock: Int!,
      qty: Int!
    }
    type Query {
      products: [Product]!
    }
    type Mutation {
      updateProduct(input: UpdateProductInput): Product!
    }
  `,
  resolvers: {
    Query: {
      products: () => products
    },
    Mutation: {
      updateProduct: (parent: unknown, args: { input: UpdateProductInput }) => {
        const productId = args.input.id
        let productRecord = products.findIndex(pro => {
          return pro.id === productId
        })

        if (productRecord !== -1) {
          products[productRecord] = args.input
          console.log('set products', products[productRecord])
          console.log(products)
        } else {
          products.push(args.input)
          console.log('pushed product', args.input)
          return args.input
        }
        return products[productRecord]
      }
    }
  }
})