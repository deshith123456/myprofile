import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

if (uri && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))) {
    try {
        if (process.env.NODE_ENV === 'development') {
            let globalWithMongo = global as typeof globalThis & {
                _mongoClientPromise?: Promise<MongoClient>
            }
            if (!globalWithMongo._mongoClientPromise) {
                client = new MongoClient(uri, options)
                globalWithMongo._mongoClientPromise = client.connect()
            }
            clientPromise = globalWithMongo._mongoClientPromise
        } else {
            client = new MongoClient(uri, options)
            clientPromise = client.connect()
        }
    } catch (e) {
        console.error('MongoDB client initialization error:', e)
    }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export async function getDb(): Promise<Db> {
    if (!clientPromise) {
        throw new Error('MongoDB not initialized. Check MONGODB_URI.')
    }
    const client = await clientPromise
    return client.db(process.env.MONGODB_DB || 'portfolio')
}
