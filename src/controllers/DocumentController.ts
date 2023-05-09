import { Request, ResponseToolkit } from '@hapi/hapi';
import { autoInjectable } from 'tsyringe';
import { controller, get, options } from 'hapi-decorators';
import * as Joi from 'joi';

import { BaseController } from './BaseController';
import axios from 'axios';
import { documentSchema } from '../validators';

interface Document {
    id: number;
    fileName: string;
    url: string;
}

const documents: Document[] = [
    {
        id: 1,
        fileName: 'Sample 1',
        url: 'https://www.africau.edu/images/default/sample.pdf',
    },
    {
        id: 2,
        fileName: 'Sample 2',
        url: 'https://www.cambridgeenglish.org/images/153310-movers-sample-papers-volume-2.pdf',
    },
    {
        id: 3,
        fileName: 'Sample 3',
        url: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf',
    },
];

@autoInjectable()
@controller('/documents')
export class DocumentController extends BaseController {
    constructor() {
        super();
    }

    @get('/')
    @options({
        description: 'Get all documents',
        tags: ['api', 'documents'],
        response: {
            schema: Joi.array().items(documentSchema),
        },
    })
    public async getDocuments(request: Request, h: ResponseToolkit) {
        return documents;
    }

    @get('/{id}')
    @options({
        description: 'Get a document by ID',
        tags: ['api', 'documents'],
        response: {
            schema: documentSchema,
        },
        validate: {
            params: Joi.object({
                id: Joi.number().integer().min(1),
            }),
        },
    })
    public async getDocument(request: Request, h: ResponseToolkit) {
        const id = parseInt(request.params.id, 10);
        const document = documents.find((doc) => doc.id === id);

        if (!document) {
            return h.response('Document not found').code(404);
        }

        return document;
    }

    @get('/{id}/download')
    @options({
        description: 'Get a PDF version of a document by ID',
        tags: ['api', 'documents'],
        validate: {
            params: Joi.object({
                id: Joi.number().integer().min(1),
            }),
        },
    })
    public async downloadDocument(request: Request, h: ResponseToolkit) {
        const id = parseInt(request.params.id, 10);
        const document = documents.find((doc) => doc.id === id);

        if (!document) {
            return h.response('Document not found').code(404);
        }

        // Download the file from the remote URL
        const { data } = await axios.get(document.url, {
            responseType: 'arraybuffer',
        });

        // Send the file buffer to the client
        return h
            .response(data as any)
            .header('Content-Type', 'application/pdf')
            .header(
                'Content-Disposition',
                `attachment; filename=${document.fileName}.pdf`
            );
    }
}
