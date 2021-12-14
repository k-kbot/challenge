## 課題１（実装）

### 01_「常連顧客を特定して欲しい」
```sql
SELECT CustomerID,
    Count(OrderID) AS OrderCount
FROM Orders
WHERE OrderDate LIKE '1996%'
GROUP BY CustomerID
HAVING OrderCount >= 3
ORDER BY OrderCount DESC
```

### 02_「一度の注文で、最大どれぐらいの注文詳細が紐づく可能性があるのか」
```sql
SELECT OrderID,
    Count(OrderDetailID) AS OrderDetailCount
FROM OrderDetails
GROUP BY OrderID
HAVING OrderDetailCount = (
        SELECT MAX(OrderDetailCount)
        FROM (
                SELECT OrderID,
                    COUNT(OrderID) AS OrderDetailCount
                FROM OrderDetails
                GROUP BY OrderID
            )
    )
```

### 03_「一番お世話になっている運送会社を教えて欲しい」
```sql
SELECT ShipperID,
    Count(OrderID) AS ShippingCount
FROM Orders
GROUP BY ShipperID
ORDER BY ShippingCount DESC
```

### 04_「重要な市場を把握したい」
```sql
SELECT ROUND(SUM(OD.Quantity * P.Price)) AS sales,
    C.country
FROM Customers AS C
    JOIN Orders AS O ON C.CustomerID = O.CustomerID
    JOIN OrderDetails AS OD ON O.OrderID = OD.OrderID
    JOIN Products AS P ON OD.ProductID = P.ProductID
GROUP BY C.Country
ORDER BY sales DESC
```

### 05_国ごとの売上を年毎に（1月1日~12月31日の間隔で）集計
```sql
SELECT ROUND(SUM(OD.quantity * P.price)) AS sales,
    strftime('%Y', O.OrderDate) AS OrderYear,
    C.Country
FROM Customers AS C
    JOIN Orders AS O ON O.CustomerID = C.CustomerID
    JOIN OrderDetails AS OD ON OD.OrderID = O.OrderID
    JOIN Products AS P ON P.ProductID = OD.ProductID
GROUP BY C.Country
```

### 06_「社内の福利厚生の規定が変わったので、年齢が一定以下の社員には、それとわかるようにフラグを立てて欲しい」
- Employeeテーブルに「Junior（若手）」カラム（boolean）を追加
```sql
ALTER TABLE Employees
ADD Junior BOOLEAN
```

- 若手に分類されるEmployeeのJuniorカラムをTRUEに更新
  - Juniorの定義：誕生日が1960年より後
```sql
UPDATE Employees
SET Junior = TRUE
WHERE strftime('%Y', BirthDate) > '1960'
```

### 07_「長くお世話になった運送会社には運送コストを多く払うことになったので、たくさん運送をお願いしている業者を特定して欲しい」
- 「long_relation」カラム（boolean）をShipperテーブルに追加
```sql
ALTER TABLE Shippers
ADD long_relation BOOLEAN
```

- long_relationがtrueになるべきShipperレコードを特定して、long_relationをTRUEに更新
  - long_relationの定義：これまでに70回以上、Orderに関わったShipper
```sql
UPDATE Shippers
SET long_relation = TRUE
WHERE ShipperID = (
        SELECT ShipperID
        FROM Orders
        GROUP BY ShipperID
        HAVING Count(ShipperID) >= 70
    )
```

### 08_「それぞれのEmployeeが最後に担当したOrderと、その日付を取得してほしい」
```sql
SELECT EmployeeID,
    OrderDate AS LatestOrderDate,
    OrderID
FROM Orders
GROUP BY EmployeeID
HAVING MAX(OrderDate)
```

### 09_NULLの扱い
- Customerテーブルで任意の１レコードのCustomerNameをNULLに更新
```sql
UPDATE Customers
SET CustomerName = NULL
WHERE CustomerID = 1
```

- CustomerNameが存在するユーザを取得するクエリ
```sql
SELECT *
FROM Customers
WHERE CustomerName IS NOT NULL
```

- CustomerNameが存在しない（NULLの）ユーザを取得するクエリ
```sql
SELECT *
FROM Customers
WHERE CustomerName IS NULL
```

### 10_JOINの違い
- EmployeeId=1の従業員のレコードを、Employeeテーブルから削除
```sql
DELETE FROM Employees
WHERE EmployeeID = 1
```

- （削除された）EmloyeeId=1が担当したOrdersを表示しないクエリ
```sql
SELECT OrderID,
    CustomerID,
    E.EmployeeID,
    OrderDate,
    ShipperID
FROM Employees AS E
    JOIN Orders AS O ON E.EmployeeID = O.EmployeeID
```

- （削除された）EmloyeeId=1が担当したOrdersを表示する（Employeesに関する情報はNULLで埋まる）クエリ
```sql
SELECT OrderID,
    CustomerID,
    E.EmployeeID,
    OrderDate,
    ShipperID
FROM Employees AS E
    LEFT JOIN Orders AS O ON E.EmployeeID = O.EmployeeID
```

## 課題２（質問）
- 「WHERE」と「HAVING」の違い
```
WHERE句は、SELECT句の結果から指定した条件で抽出する
HAVING句は、GROUP BY句でグルーピングした結果から指定した条件を抽出する
```

- SQLの文脈で、DDL, DML, DCL, TCLとは
```
DDL: Data Definition Language CREATEやDROP、ALTERなどデータベースオブジェクトの生成や削除変更を行う

DML: Data Manipulation Language SELECT/INSERT/UPDATE/DELETEなどテーブルに対するデータの取得・追加・更新・削除を行う

TCL: Transaction Control Language BEGIN、COMMIT、ROLLBACKなどトランザクションの制御を行う

DCL: Data Control Language GRANT, REVOKEなどデータベースシステムの権限、アクセス許可、およびその他の制御を行う
```

## 課題３（クイズ）
```
WHERE句をつけ忘れたUPDATE文, DELETE文を実行すると、テーブルの全レコードを更新・削除して大惨事になることがある。MySQLにはこれを予防する仕組みがあるが、何というモードか？
```
