---
title: '[MongoDB] Best Practice'
created_at: 2020-05-10 09:27:01
tag: ["Mongo","MongoDB","Best Practice"]
toc: true
---

# 1 Connection String {#connection-string}

```http
mongodb://mongodb-server-1:27017,mongodb-server-2:27017/admin?replicaSet=test-replica-set&ssl=false&readConcernLevel=majority&readPreference=secondaryPreferred&w=3&wtimeoutMS=5000
```

# 1.1 Write Concern {#write-concern}

写操作配置，作用于mongodb server。比如上面的`w=3`表示数据要至少写入到3个节点才返回到应用中，通常需搭配`wtimeoutMS`一起使用，如果不足3个节点，则会抛出如下错误。
```json
{
  "code": 100,
  "codeName": "CannotSatisfyWriteConcern",
  "errmsg": "Not enough data-bearing nodes"
}
```

也可以设置为`w=majority`, 让mongodb自动决定写入几个节点即返回。

# 1.2 Read Preference {#read-preference}

读操作配置，作用于mongodb client。指示客户端使用哪个节点进行读取操作。

# 1.3 Read Concern {#read-concern}

读操作配置，作用于mongodb server。待补充...

# 2 Reference {#reference}

1. https://docs.mongodb.com/manual/reference/glossary/
2. https://docs.mongodb.com/manual/reference/command/nav-crud/
3. https://docs.mongodb.com/manual/reference/connection-string/
4. https://docs.mongodb.com/manual/reference/write-concern/
5. https://docs.mongodb.com/manual/reference/read-concern/
7. https://docs.mongodb.com/manual/reference/method/js-replication/


## 2.2 Replica Set {#reference-replica-set}

1. https://docs.mongodb.com/manual/replication/
2. https://docs.mongodb.com/manual/core/replica-set-hidden-member/
3. https://docs.mongodb.com/manual/core/replica-set-sync/
4. https://docs.mongodb.com/manual/core/replica-set-oplog/
5. https://docs.mongodb.com/manual/applications/replication/
6. https://docs.mongodb.com/manual/core/replica-set-write-concern/
7. https://docs.mongodb.com/manual/core/read-preference/
8. https://docs.mongodb.com/manual/reference/read-concern-majority/