# twoflags-api

TwoFlags is an OpenSource Feature Flags service built on
Cloudflare Workers and Workers KV. 

It supports:
- Multi-tenancy, Multiple accounts on the same service
- Environments
- Namespaces
- Flag types: `string`, `number`, `boolean`, `segment`
- String flag's selectors to name string values
- Segments flags for A/B Tests
    - Correlation UID (Anonymized user will always receive the same value)
    - Segment progression doesn't affect previous values. 
    - (Coming soon) User Overrides
- API Keys
- Optimized Resolver Endpoint
- [React SDK](https://www.npmjs.com/package/@twoflags/react-featureflags)
- [API Documentation](https://twoflags-io.github.io/twoflags/) With OpenAPI 3.0 spec.   

To install on your own Cloudflare Account follow the steps in [INSTALL](./INSTALL.md)
