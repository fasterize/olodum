#!/bin/bash

cd test

for test in `ls`; do
	echo "Launching test : $test"
	vows $test --spec
	echo ""
done