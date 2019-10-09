require = require('esm')(module)
const { default: parse } = require('.')

describe('parsing a proper link header with next and last', () => {
    const link =
        '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100>; rel="next", ' +
        '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100>; rel="last"'

    const res = parse(link)

    test('parses out link, page and perPage for next and last', () => {
        expect(res).toEqual(
        {
            next:
            {
                client_id: '1',
                client_secret: '2',
                page: '2',
                per_page: '100',
                rel: 'next',
                url: 'https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100'
            },
            last:
            {
                client_id: '1',
                client_secret: '2',
                page: '3',
                per_page: '100',
                rel: 'last',
                url: 'https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100'
            }
        })
    })
})

describe('handles unquoted relationships', () => {
    const link =
        '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100>; rel=next, ' +
        '<https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100>; rel=last'

    const res = parse(link)

    test('parses out link, page and perPage for next and last', () => {
        expect(res).toEqual(
        {
            next:
            {
                client_id: '1',
                client_secret: '2',
                page: '2',
                per_page: '100',
                rel: 'next',
                url: 'https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=2&per_page=100'
            },
            last:
            {
                client_id: '1',
                client_secret: '2',
                page: '3',
                per_page: '100',
                rel: 'last',
                url: 'https://api.github.com/user/9287/repos?client_id=1&client_secret=2&page=3&per_page=100'
            }
        })
    })
})

describe('parsing a proper link header with next, prev and last', () => {
    const linkHeader =
        '<https://api.github.com/user/9287/repos?page=3&per_page=100>; rel="next", ' +
        '<https://api.github.com/user/9287/repos?page=1&per_page=100>; rel="prev", ' +
        '<https://api.github.com/user/9287/repos?page=5&per_page=100>; rel="last"'

    const res = parse(linkHeader)

    test('parses out link, page and perPage for next, prev and last', () => {
        expect(res).toEqual(
        {
            next:
            {
                page: '3',
                per_page: '100',
                rel: 'next',
                url: 'https://api.github.com/user/9287/repos?page=3&per_page=100'
            },
            prev:
            {
                page: '1',
                per_page: '100',
                rel: 'prev',
                url: 'https://api.github.com/user/9287/repos?page=1&per_page=100'
            },
            last:
            {
                page: '5',
                per_page: '100',
                rel: 'last',
                url: 'https://api.github.com/user/9287/repos?page=5&per_page=100'
            }
        })
    })
})

describe('parsing an empty link header', () => {
    const linkHeader = ''
    const res = parse(linkHeader)

    test('returns null', () => expect(res).toEqual(null))
})

describe('parsing a proper link header with next and a link without rel', () => {
    const linkHeader =
        '<https://api.github.com/user/9287/repos?page=3&per_page=100>; rel="next", ' +
        '<https://api.github.com/user/9287/repos?page=1&per_page=100>; pet="cat", '

    const res = parse(linkHeader)

    test('parses out link, page and perPage for next only', () => {
        expect(res).toEqual(
        {
            next:
                {
                    page: '3',
                    per_page: '100',
                    rel: 'next',
                    url: 'https://api.github.com/user/9287/repos?page=3&per_page=100'
                }
        })
    })
})

describe('parsing a proper link header with next and properties besides rel', () => {
    const linkHeader =
        '<https://api.github.com/user/9287/repos?page=3&per_page=100>; rel="next"; hello="world"; pet="cat"'

    const res = parse(linkHeader)

    test('parses out link, page and perPage for next and all other properties', () => {
        expect(res).toEqual(
            {
                next:
                {
                    page: '3',
                    per_page: '100',
                    rel: 'next',
                    hello: 'world',
                    pet: 'cat',
                    url: 'https://api.github.com/user/9287/repos?page=3&per_page=100'
                }
            }
        )
    })
})

describe('parsing a proper link header with a comma in the url', () => {
    const linkHeader =
        '<https://imaginary.url.notreal/?name=What,+me+worry>; rel="next";'

    const res = parse(linkHeader)

    test('correctly parses URL with comma', () => {
        expect(res).toEqual(
            {
                next:
                {
                    rel: 'next',
                    name: 'What, me worry',
                    url: 'https://imaginary.url.notreal/?name=What,+me+worry'
                }
            }
        )
    })
})

describe('parsing a proper link header with a multi-word rel', () => {
    const linkHeader =
        '<https://imaginary.url.notreal/?name=What,+me+worry>; rel="next page";'

    const res = parse(linkHeader)

    test('correctly parses multi-word rels', () => {
        expect(res).toEqual(
            {
                page: {
                    rel: 'page',
                    name: 'What, me worry',
                    url: 'https://imaginary.url.notreal/?name=What,+me+worry'
                },
                next: {
                    rel: 'next',
                    name: 'What, me worry',
                    url: 'https://imaginary.url.notreal/?name=What,+me+worry'
                }
            }
        )
    })
})

describe('parsing a proper link header with matrix parameters', () => {
    const linkHeader =
        '<https://imaginary.url.notreal/segment;foo=bar;baz/item?name=What,+me+worry>; rel="next";'

    const res = parse(linkHeader)
    test('correctly parses url with matrix parameters', () => {
        expect(res).toEqual(
            {
                next: {
                    rel: 'next',
                    name: 'What, me worry',
                    url: 'https://imaginary.url.notreal/segment;foo=bar;baz/item?name=What,+me+worry'
                }
            }
        )
    })
})

describe('multiple links for a single rel rel', () => {
    const linkHeader =
        '<http://example.com/one>; rel="service",' +
        '<http://example.com/two>; rel="service",' +
        '<http://example.com/three>; rel="service"'

    const res = parse(linkHeader)

    test('multiple links for a single rel', () => {
        expect(res).toEqual(
            {
                service: [
                    {
                        rel: 'service',
                        url: 'http://example.com/one'
                    },
                    {
                        rel: 'service',
                        url: 'http://example.com/two'
                    },
                    {
                        rel: 'service',
                        url: 'http://example.com/three'
                    }
                ]
            }
        )
    })
})