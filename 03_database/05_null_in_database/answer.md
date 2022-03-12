## 課題１

> NULL = 0, NULL = NULL, NULL <> NULL, NULL AND TRUE

NULL

> NULL AND FALSE

0

> NULL OR TRUE

1

## 課題２


```sql
TABLE assignee {
  id: varchar NOT NULL
}

TABLE Issue {
  id: varchar NOT NULL
  text: varchar NOT NULL
}

TABLE assignee_issue_relations {
  id: varchar NOT NULL
  assignee_id: varchar NOT NULL
  issue_id: varchar NOT NULL
}
```

## 課題３
SQLクエリで以下の式を実行した時の結果を答えてください。

- 1 + NULL
- 2 - NULL
- 3 * NULL
- 4 / NULL
- NULL / 0 
