## Getting Started

Metrics can be found on http://localhost:3030/metrics

1. Run docker file:
   ```
   docker build -t prometheus:test .
   docker run -p 9090:9091 prometheus:test
   ```
2. Set up your graps

   - Targets

     > http://localhost:9090/targets

   - Graph
     > http://localhost:9090/graph
