from SPARQLWrapper import SPARQLWrapper, JSON
import pandas as pd

# Define the endpoint
sparql = SPARQLWrapper("https://politics.ld.admin.ch/query/")
sparql.setReturnFormat(JSON)

# Example query: get water level data (you’ll need to customize this)
sparql.setQuery("""
PREFIX dct: <http://purl.org/dc/terms/>
SELECT ?station ?value ?date
WHERE {
  ?obs dct:subject ?station ;
       dct:date ?date ;
       dct:description ?value .
}
LIMIT 100
""")

# Execute and parse results
results = sparql.query().convert()
data = [
    {
        "station": r["station"]["value"],
        "value": r["value"]["value"],
        "date": r["date"]["value"]
    }
    for r in results["results"]["bindings"]
]

df = pd.DataFrame(data)
print(df.head())
