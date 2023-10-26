/// <reference path="../clients/people/people.d.ts" />
'use strict'

/** @param {import('fastify').FastifyInstance} fastify */
module.exports = async function(fastify, opts) {
  fastify.decorate('example', 'foobar')

  fastify.platformatic.addComposerOnRouteHook('/asset-service/assets/', ['GET'], function(routeOptions) {
    // enrich response Swagger
    const responseSchema = routeOptions.schema.response[200];
    const entitySchema = responseSchema?.items ?? responseSchema;
    entitySchema.properties.aRandomPerson = {
      id: 'number',
      name: 'string',
      createdAt: 'string',
      updatedAt: 'string',
    };
    entitySchema.required = ['aRandomPerson'];

    function buildOnComposerResponseCallback(peopleProps) {
      return async function addPeopleToResponse(request, reply, body) {
        let entities = await body.json()

        const multipleEntities = Array.isArray(entities)
        if (!multipleEntities) {
          entities = [entities]
        }

        const peopleIds = []
        for (const entity of entities) {
          for (const { idProp } of peopleProps) {
            peopleIds.push(entity[idProp])
          }
        }

        const people = await request.people.getPeople({ "where.id.in": peopleIds.join(',') })

        const getPersonById = (id) => {
          return people.find(person => person.id === id) ?? null;
        }

        for (let entity of entities) {
          for (const { idProp, nameProp } of peopleProps) {
            entity[nameProp] = getPersonById(entity[idProp])
          }
        }

        reply.send(multipleEntities ? entities : entities[0])
      }
    }

    // enrich response at runtime
    routeOptions.config.onComposerResponse = buildOnComposerResponseCallback([
      { idProp: 'id', nameProp: "aRandomPerson" }
    ]);
  })
}

