# Run the python tests
src/manage.py test base
STATUS=$?
if [ $STATUS -ne 0 ]
then exit $STATUS
fi

# Change to the jasmine directory and run the JS tests
cd src/base/jasmine/
bundle exec rake jasmine:ci
STATUS=$?
if [ $STATUS -ne 0 ]
then exit $STATUS
fi
cd ../../..
