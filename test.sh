#!/bin/bash

echo "Running tests"

errorMsg="AssertionError"
errorOutput="test.log" 

cd node-test &&  ./run.sh | tee $errorOutput

numberErrors=`grep $errorMsg $errorOutput | wc -l`

echo 
echo "Errors in test $numberErrors, full log at '`pwd`/$errorOutput'"

exit $numberErrors
