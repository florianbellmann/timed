
# timed

`timed` is a super lightweight CLI timetracking tool

It was build with a TDD and hex architecture approach. Basically a learning project. The state of the source code is very messy and unfinished. For now it works for my personal use though.


## Refactoring backlog

- refactor really to hex architecture
- refactor to CQS
- separate decisions from actions
- refactor tests to be output based and mock filesystem calls
- on file system level use different files every tests. this way test isolation and parallelism is garanteed!
- if tests cant run in parallel thats an indicator that your tests are not well written
- try redis for timed? as in memory db that is also persisting? no service though
