# timed

CLI Interface to do lightweight superfast timetracking

change to last N entries and configure? not static 50?
its too much anyway

# Ideas

*   TDD Approach
*   Maybe use a pipeline as a build server with releases?
*   80/20 feature analysis in the beginning

built with a test driven design approach

*   command to directly edit and fix timelog in nvim

1.  beatify cli(inputs and display)

    // TODO: roadmap: maybe add additional logic that actually calculates time by start and end
    // then also gives hints if a session isnt done yet

refactoring backlog

refactor really to hex architecture
refactor to CQS
separate decisions from actions
refactor tests to be output based and mock filesystem calls
on file system level use different files every tests. this way test isolation and parallelism is garanteed!
if tests cant run in parallel thats an indicator that your tests are not well written

maybe setup usual refactoring backlog for checking my developed code

maybe remove top level log catching. log inside the method that throws/catches


mock filesysyem
decisions from actionshex has one way deps
domain makes decisions
app service acts on it

test double

mock / stub

save date as timestamp to csv > is this better for general parsing? > will make reading of the csv harder. but display will always be human anyway

every method command or query


top level should only make sure the app doesn't crash and restarts it


when finished make a review of lessons learned/maybe combine with notes from unit testing book
then refactor trecli
sketch out application first

dont mix domain / business code with out of process deps
action creators for business layer (like reux)
let vscode show cyclo complexity

use peristor classs

test trivial code through integration tests. unit tests are not needed here
look into what you want to test and how
ratio integration and unit tests

restructure app on paper

try to encorporate this https://bazaglia.com/clean-architecture-with-typescript-ddd-onion/
unclear is still how the infrastructure is communicating with the application
service or domain. i mean it should be a one way dependency flow not both ways
to the app service


# finalize this ASAP

try redis for timed? as in memory db that is also persisting? no service though
